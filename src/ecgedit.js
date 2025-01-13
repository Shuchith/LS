// import React, { useEffect, useState } from 'react';
// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS } from 'chart.js';
// import {
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// } from 'chart.js';

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// const ECGChart = () => {
//   const [ecgData, setEcgData] = useState([]);
//   const [annotations, setAnnotations] = useState([]);
//   const [uniqueSymbols, setUniqueSymbols] = useState([]);
//   const [selectedSymbols, setSelectedSymbols] = useState(new Set());
//   const [annotationsData, setAnnotationsData] = useState([]);
  
//   useEffect(() => {
//     // Fetch JSON data containing ECG data and annotations
//     fetch('/101_data.json')  
//       .then(response => response.json())
//       .then(data => {
//         setEcgData(data.ecg_data.flat().slice(0, 500));
//         setAnnotations(data.annotations);
//         setUniqueSymbols(data.unique_symbols);
//         setSelectedSymbols(new Set(data.unique_symbols)); 
//         setAnnotationsData(data.annotations);
//       });
//   }, []);

//   const handleSymbolToggle = (symbol) => {
//     const newSelection = new Set(selectedSymbols);
//     if (newSelection.has(symbol)) {
//       newSelection.delete(symbol);
//     } else {
//       newSelection.add(symbol);
//     }
//     setSelectedSymbols(newSelection);
//   };

//   const filteredAnnotations = annotationsData.sample
//     .map((sample, index) => ({
//       x: sample,
//       y: ecgData[sample],
//       symbol: annotationsData.symbol[index],
//     }))
//     .filter(item => selectedSymbols.has(item.symbol));

//   const chartData = {
//     labels: Array.from({ length: ecgData.length }, (_, i) => i),
//     datasets: [
//       {
//         label: 'ECG Waveform',
//         data: ecgData,
//         borderColor: 'blue',
//         borderWidth: 1,
//         pointRadius: 0,
//       },
//       {
//         label: 'Annotations',
//         data: filteredAnnotations,
//         pointBackgroundColor: 'red',
//         pointRadius: 3,
//         type: 'scatter',
//       }
//     ],
//   };

//   const updateAnnotationSymbol = (index, newSymbol) => {
//     const updatedAnnotations = { ...annotationsData };
//     updatedAnnotations.symbol[index] = newSymbol;
//     setAnnotationsData(updatedAnnotations);
//   };

//   const saveAnnotationsToFile = () => {
//     const updatedData = {
//       ecg_data: ecgData,
//       annotations: annotationsData,
//       unique_symbols: uniqueSymbols,
//     };
//     const blob = new Blob([JSON.stringify(updatedData)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = 'updated_annotations.json';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div>
//       <h2>ECG Waveform Visualization</h2>
      
//       {/* Symbol Filter */}
//       <div>
//         {uniqueSymbols.map(symbol => (
//           <label key={symbol} style={{ marginRight: '10px' }}>
//             <input
//               type="checkbox"
//               checked={selectedSymbols.has(symbol)}
//               onChange={() => handleSymbolToggle(symbol)}
//             />
//             {symbol}
//           </label>
//         ))}
//       </div>

//       <Line data={chartData} options={{ responsive: true }} />

//       {/* Edit Annotations */}
//       <div>
//         <h3>Edit Annotations</h3>
//         <table>
//           <thead>
//             <tr>
//               <th>Sample</th>
//               <th>Current Symbol</th>
//               <th>Edit Symbol</th>
//             </tr>
//           </thead>
//           <tbody>
//             {annotationsData.sample.slice(0, 10).map((sample, index) => (
//               <tr key={index}>
//                 <td>{sample}</td>
//                 <td>{annotationsData.symbol[index]}</td>
//                 <td>
//                   <input
//                     type="text"
//                     value={annotationsData.symbol[index]}
//                     onChange={(e) => updateAnnotationSymbol(index, e.target.value)}
//                   />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Save Button */}
//       <button onClick={saveAnnotationsToFile}>Save Changes</button>
//     </div>
//   );
// };

// export default ECGChart;
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';

// Register chart.js components
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ECGChart = () => {
  const [ecgData, setEcgData] = useState([]);
  const [annotationsData, setAnnotationsData] = useState([]);
  const [uniqueSymbols, setUniqueSymbols] = useState([]);
  const [selectedSymbols, setSelectedSymbols] = useState(new Set());
  
  useEffect(() => {
    // Fetch JSON data containing ECG data and annotations
    fetch('/100_data.json')  // Adjust the path to your data
      .then(response => response.json())
      .then(data => {
        setEcgData(data.ecg_data.flat().slice(0, 500));  // Only render the first 5000 points for performance
        setAnnotationsData(data.annotations);
        setUniqueSymbols(data.unique_symbols);
        setSelectedSymbols(new Set(data.unique_symbols));  // Default: All symbols selected
      });
  }, []);

  // Check if the data is loaded before rendering the chart
  if (!ecgData.length || !annotationsData.sample) {
    return <div>Loading...</div>;  // Display loading until data is fetched
  }

  const handleSymbolToggle = (symbol) => {
    const newSelection = new Set(selectedSymbols);
    if (newSelection.has(symbol)) {
      newSelection.delete(symbol);
    } else {
      newSelection.add(symbol);
    }
    setSelectedSymbols(newSelection);
  };

  const filteredAnnotations = annotationsData.sample
    .map((sample, index) => ({
      x: sample,
      y: ecgData[sample],
      symbol: annotationsData.symbol[index],
    }))
    .filter(item => selectedSymbols.has(item.symbol));

  const chartData = {
    labels: Array.from({ length: ecgData.length }, (_, i) => i),
    datasets: [
      {
        label: 'ECG Waveform',
        data: ecgData,
        borderColor: 'blue',
        borderWidth: 1,
        pointRadius: 0,
      },
      {
        label: 'Annotations',
        data: filteredAnnotations,
        pointBackgroundColor: 'red',
        pointRadius: 3,
        type: 'scatter',
      }
    ],
  };

  const updateAnnotationSymbol = (index, newSymbol) => {
    const updatedAnnotations = { ...annotationsData };
    updatedAnnotations.symbol[index] = newSymbol;
    setAnnotationsData(updatedAnnotations);
  };

  const saveAnnotationsToFile = () => {
    const updatedData = {
      ecg_data: ecgData,
      annotations: annotationsData,
      unique_symbols: uniqueSymbols,
    };
    const blob = new Blob([JSON.stringify(updatedData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'updated_annotations.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2>ECG Waveform Visualization</h2>
      
      {/* Symbol Filter */}
      <div>
        {uniqueSymbols.map(symbol => (
          <label key={symbol} style={{ marginRight: '10px' }}>
            <input
              type="checkbox"
              checked={selectedSymbols.has(symbol)}
              onChange={() => handleSymbolToggle(symbol)}
            />
            {symbol}
          </label>
        ))}
      </div>

      <Line data={chartData} options={{ responsive: true }} />

      {/* Edit Annotations */}
      <div>
        <h3>Edit Annotations</h3>
        <table>
          <thead>
            <tr>
              <th>Sample</th>
              <th>Current Symbol</th>
              <th>Edit Symbol</th>
            </tr>
          </thead>
          <tbody>
            {annotationsData.sample.slice(0, 10).map((sample, index) => (
              <tr key={index}>
                <td>{sample}</td>
                <td>{annotationsData.symbol[index]}</td>
                <td>
                  <input
                    type="text"
                    value={annotationsData.symbol[index]}
                    onChange={(e) => updateAnnotationSymbol(index, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <button onClick={saveAnnotationsToFile}>Save Changes</button>
    </div>
  );
};

export default ECGChart;
