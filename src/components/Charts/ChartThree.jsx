import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {Chart, ArcElement} from 'chart.js'
Chart.register(ArcElement);






export const ChartThree = () => {
  const [chart, setChart] = useState({
    labels: [
      'Red',
      'Blue',
      'Yellow'
    ],
    datasets: [{
      label: 'My First Dataset',
      data: [300, 50, 100],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)',
      ],
      hoverOffset: 4
    }],
    type: 'doughnut',
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Chart.js Doughnut Chart'
        }
      }
    },
  });

  const handleReset = () => {
    setState((prevState) => ({
      ...prevState,
      series: [65, 34, 12, 56],
    }));
  };
  handleReset;
  useEffect(()=>{
    
    // var res = await Promise.resolve(fetch('http://127.0.0.1:5000/graph_data/top_customers')) 
    // var data  = res.json()
    // console.log(data)
  const getData = async () => {
    var res = await Promise.resolve(fetch('http://127.0.0.1:5000/graph_data/payment_method_popularity'))
    const label = [];
    const count  = [];
    
    const data = await res.json()
    console.log(data) 
    for(let i=0;i<data.length;i++){
      label.push(data[i].payment_method)
      count.push(Number(data[i].usage_count))
    }
    console.log(label, count)
    setChart({
      labels: label,
      datasets: [{
        label: 'My First Dataset',
        data: count,
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(144,238,144)',
        ],
        hoverOffset: 4
      }]
    })
    //return res.json()
  }
  getData()
  

     
  ;
},[]);
  return (
    <div className="sm:px-7.5 col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5>Payment method popularity</h5>
        </div>
        <div>
          <div className="relative z-20 inline-block">
            
            
          </div>
        </div>
      </div>

      <div className="mb-2">
        <div id="chartThree" className="mx-auto flex justify-center">
          <Doughnut data={chart} 
          />
          
        </div>
      </div>

    
    </div>
  );
};

export default ChartThree;
