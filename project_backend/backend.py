import json
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
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
@cross_origin()
def items_table_handler():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # Dictionary cursor for JSON compatibility
    print(request.method)
    try:
        if request.method == 'POST':
            # Insert a new record (fields and values sent via JSON body)
            payload = request.json
            fields = ', '.join(payload.keys())
            placeholders = ', '.join(["%s"] * len(payload))
            query = f"INSERT INTO Items ({fields}) VALUES ({placeholders})"
            print(query, tuple(payload.values()))
            cursor.execute(query, tuple(payload.values()))
            conn.commit()
            response = jsonify({"message": "Record inserted successfully"})
            #response.headers.add("Access-Control-Allow-Origin", "*")
            #response.headers.add("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
            return response, 201

        elif request.method == 'PUT':
            # Update a record based on primary key/id (id and update fields sent via JSON body)
            payload = request.json
            record_id = payload.pop('item_id', None)
            print('put', record_id, payload)
            if not record_id:
                response = jsonify({"error": "ID is required for update"})
                response.headers.add("Access-Control-Allow-Origin", "*")
                return response, 400
            updates = ', '.join([f"{key} = %s" for key in payload.keys()])
            query = f"UPDATE Items SET {updates} WHERE item_id = %s"
            print(query)
            cursor.execute(query, (*payload.values(), record_id))
            conn.commit()
            response = jsonify({"message": "Record updated successfully"})
            #response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 200

        elif request.method == 'DELETE':
            # Delete a record by primary key/id (id sent via query parameter)
            print(request.json, request.args.get('item_id'), request.args)
            record_id = request.json
            if not record_id:
                return jsonify({"error": "ID is required for delete"}), 400
            query = "DELETE FROM Items WHERE item_id = %s"
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
            response = jsonify(records)
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 200

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
                c.name, 
                SUM(i.total) AS total_spent
            FROM Customer c
            JOIN Orders o ON c.customer_id = o.customer_id
            JOIN Invoice i ON o.order_id = i.order_id
            GROUP BY c.customer_id, c.name
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
    print(query)
    try:
        cursor.execute(query)
        results = cursor.fetchall()
        response = jsonify(results)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 200

    except mysql.connector.Error as e:
        response = jsonify({"error": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

    finally:
        cursor.close()

if __name__ == '__main__':
    app.run(debug=True)
