import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const ChartOne = () => {
  const [labels, setLabel] = useState(null);
  const [data, setData] = useState({
    labels: labels,
    datasets: [{
      label: 'Expenses by Month',
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: [
        'rgb(153, 102, 255)'
      ],
      borderColor: [
        'rgb(153, 102, 255)'
      ],
      borderWidth: 1
    }]
  });

  useEffect(()=>{
    
      // var res = await Promise.resolve(fetch('http://127.0.0.1:5000/graph_data/top_customers')) 
      // var data  = res.json()
      // console.log(data)
    const getData = async () => {
      var res = await Promise.resolve(fetch('http://127.0.0.1:5000/graph_data/top_customers'))
      const xaxis = [];
      const spend  = [];
      
      const data = await res.json()
      console.log(data.length) 
      for(let i=0;i<data.length;i++){
        xaxis.push(data[i].name)
        spend.push(Number(data[i].total_spent))
      }
      console.log(xaxis, spend)
      setData({
        labels: xaxis,
        datasets: [{
          label: 'Top Customers',
          data: spend,
          backgroundColor: [
            'rgb(153, 102, 255)'
          ],
          borderColor: [
            'rgb(153, 102, 255)'
          ],
          borderWidth: 1
        }]
      })
      //return res.json()
    }
    getData()
    

       
    ;
  },[]);
  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            
            <div className="w-full">
              
            </div>
          </div>
          <div className="flex min-w-47.5">
            
            <div className="w-full">
              
            </div>
          </div>
        </div>
        <div className="flex w-full max-w-45 justify-end">
          <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
           
          </div>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
          <Bar data={data} />;
        </div>
      </div>
    </div>
  );
};

export default ChartOne;

async function fetchJson(url){
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Forsooth, a scourge upon our fetch quest: ' + response.statusText);
  }
  const jsonData = await response.json();
  return jsonData;
}
