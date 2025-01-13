import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
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
  const [startIdx, setStartIdx] = useState(0);
  const [endIdx, setEndIdx] = useState(100);
  const [editOriginalSymbol, setEditOriginalSymbol] = useState(''); 
  const [editNewSymbol, setEditNewSymbol] = useState('');  
  const [editIndex, setEditIndex] = useState(null);  

  useEffect(() => {
    // Fetch JSON data containing ECG data and annotations
    fetch('/102_data.json')  
      .then(response => response.json())
      .then(data => {
        setEcgData(data.ecg_data.flat());  
        setAnnotationsData(data.annotations);
        setUniqueSymbols(data.unique_symbols);
        setSelectedSymbols(new Set(data.unique_symbols));  
      });
  }, []);

  
  const filteredEcgData = ecgData.slice(startIdx, endIdx);

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
    .filter(item => selectedSymbols.has(item.symbol) && item.x >= startIdx && item.x <= endIdx);

  const chartData = {
    labels: Array.from({ length: filteredEcgData.length }, (_, i) => i + startIdx),
    datasets: [
      {
        label: 'ECG Waveform',
        data: filteredEcgData,
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

  const updateAnnotationSymbol = (index, originalSymbol, newSymbol) => {
    if (annotationsData.symbol[index] === originalSymbol) {
      const updatedAnnotations = { ...annotationsData };
      updatedAnnotations.symbol[index] = newSymbol;
      setAnnotationsData(updatedAnnotations);
    } else {
      alert('Original symbol does not match the current label!');
    }
  };

  const handleEditSubmit = (index) => {
    updateAnnotationSymbol(index, editOriginalSymbol, editNewSymbol);
    setEditIndex(null);
    setEditOriginalSymbol('');
    setEditNewSymbol('');
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
      
      {/* Range Input for Displaying Data */}
      <div>
        <label>
          Start Index: 
          <input
            type="number"
            value={startIdx}
            onChange={(e) => setStartIdx(parseInt(e.target.value, 10))}
            min={0}
            max={ecgData.length - 1}
          />
        </label>
        <label>
          End Index: 
          <input
            type="number"
            value={endIdx}
            onChange={(e) => setEndIdx(parseInt(e.target.value, 10))}
            min={startIdx + 1}
            max={ecgData.length}
          />
        </label>
      </div>

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

      {/* ECG Chart */}
      <Line data={chartData} options={{ responsive: true }} />

      {/* Edit Annotations */}
      <div>
        <h3>Edit Annotations</h3>
        <table>
          <thead>
            <tr>
              <th>Sample</th>
              <th>Current Symbol</th>
              <th>Original Symbol</th>
              <th>New Symbol</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {annotationsData.sample.slice(startIdx, endIdx).map((sample, index) => (
              <tr key={index}>
                <td>{sample}</td>
                <td>{annotationsData.symbol[index]}</td>
                <td>
                  <input
                    type="text"
                    value={editIndex === index ? editOriginalSymbol : annotationsData.symbol[index]}
                    onChange={(e) => setEditOriginalSymbol(e.target.value)}
                    disabled={editIndex !== index}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={editIndex === index ? editNewSymbol : annotationsData.symbol[index]}
                    onChange={(e) => setEditNewSymbol(e.target.value)}
                    disabled={editIndex !== index}
                  />
                </td>
                <td>
                  {editIndex === index ? (
                    <button onClick={() => handleEditSubmit(index)}>Save</button>
                  ) : (
                    <button onClick={() => { setEditIndex(index); setEditOriginalSymbol(annotationsData.symbol[index]); setEditNewSymbol(annotationsData.symbol[index]); }}>
                      Edit
                    </button>
                  )}
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
