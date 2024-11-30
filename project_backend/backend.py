import json
from flask import Flask, request, jsonify
import mysql.connector

app = Flask(__name__)

# Load configuration from config.json
with open("config.json", "r") as config_file:
    config = json.load(config_file)

DB_CONFIG = config["database"]

def get_db_connection():
    """Establish and return a MySQL database connection."""
    return mysql.connector.connect(
        database=DB_CONFIG['database'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        host=DB_CONFIG['host'],
        port=DB_CONFIG['port']
    )

@app.route('/items', methods=['POST', 'PUT', 'DELETE'])
def items_table_handler():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # Dictionary cursor for JSON compatibility

    try:
        if request.method == 'POST':
            # Insert a new record (fields and values sent via JSON body)
            payload = request.json
            fields = ', '.join(payload.keys())
            placeholders = ', '.join(["%s"] * len(payload))
            query = f"INSERT INTO items ({fields}) VALUES ({placeholders})"
            cursor.execute(query, tuple(payload.values()))
            conn.commit()
            return jsonify({"message": "Record inserted successfully"}), 201

        elif request.method == 'PUT':
            # Update a record based on primary key/id (id and update fields sent via JSON body)
            payload = request.json
            record_id = payload.pop('id', None)
            if not record_id:
                return jsonify({"error": "ID is required for update"}), 400
            updates = ', '.join([f"{key} = %s" for key in payload.keys()])
            query = f"UPDATE items SET {updates} WHERE id = %s"
            cursor.execute(query, (*payload.values(), record_id))
            conn.commit()
            return jsonify({"message": "Record updated successfully"}), 200

        elif request.method == 'DELETE':
            # Delete a record by primary key/id (id sent via query parameter)
            record_id = request.args.get('id')
            if not record_id:
                return jsonify({"error": "ID is required for delete"}), 400
            query = "DELETE FROM items WHERE id = %s"
            cursor.execute(query, (record_id,))
            conn.commit()
            return jsonify({"message": "Record deleted successfully"}), 200

    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/table_data/<table_name>', methods=['GET'])
def dynamic_table_handler(table_name):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # Dictionary cursor for JSON compatibility

    try:
        if request.method == 'GET':
            table_name = table_name.capitalize()
            # Fetch all records from the specified table
            cursor.execute(f"SELECT * FROM {table_name}")
            records = cursor.fetchall()
            return jsonify(records), 200

    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/graph_data/<query_type>', methods=['GET'])
def dynamic_graph_data_handler(query_type):
    """Dynamic endpoint for multiple queries."""
    queries = {
        "top_customers": """
            SELECT 
                c.customer_id, 
                c.customer_name, 
                SUM(i.total) AS total_spent
            FROM Customer c
            JOIN Orders o ON c.customer_id = o.customer_id
            JOIN Invoice i ON o.order_id = i.order_id
            GROUP BY c.customer_id, c.customer_name
            ORDER BY total_spent DESC
            LIMIT 5;
        """,
        "monthly_order_trends": """
            SELECT 
                DATE_FORMAT(o.date, '%Y-%m') AS order_month, 
                COUNT(o.order_id) AS total_orders
            FROM Orders o
            GROUP BY order_month
            ORDER BY order_month ASC;
        """,
        "most_popular_items": """
            SELECT 
                i.item_id, 
                i.name AS item_name, 
                SUM(o.quantity) AS total_quantity_sold
            FROM Items i
            JOIN Orders o ON i.item_id = o.item_id
            GROUP BY i.item_id, i.name
            ORDER BY total_quantity_sold DESC
            LIMIT 10;
        """,
        "payment_method_popularity": """
            SELECT 
                pm.type AS payment_method, 
                COUNT(o.payment_method_id) AS usage_count
            FROM PaymentMethod pm
            JOIN Orders o ON pm.payment_method_id = o.payment_method_id
            GROUP BY pm.type
            ORDER BY usage_count DESC;
        """,
        "revenue_by_category": """
            SELECT 
                c.category_name, 
                SUM(i.total) AS total_revenue
            FROM Category c
            JOIN Items it ON c.category_id = it.category_id
            JOIN Orders o ON it.item_id = o.item_id
            JOIN Invoice i ON o.order_id = i.order_id
            GROUP BY c.category_name
            ORDER BY total_revenue DESC;
        """
    }

    if query_type not in queries:
        return jsonify({"error": f"Invalid query_type '{query_type}'. Valid types are: {list(queries.keys())}"}), 400

    query = queries[query_type]
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(query)
        results = cursor.fetchall()
        return jsonify(results), 200

    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()

if __name__ == '__main__':
    app.run(debug=True)
