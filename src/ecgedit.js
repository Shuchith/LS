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
  const [annotationsData, setAnnotationsData] = useState({ sample: [], symbol: [] });
  const [uniqueSymbols, setUniqueSymbols] = useState([]);
  const [selectedSymbols, setSelectedSymbols] = useState(new Set());
  const [customRange, setCustomRange] = useState({ start: 0, end: 500 });
  const [sampleInput, setSampleInput] = useState('');
  const [editSymbol, setEditSymbol] = useState('');
  const [originalSymbol, setOriginalSymbol] = useState('');
  
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

  const updateCustomRange = (e) => {
    const { name, value } = e.target;
    setCustomRange(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleSampleInput = () => {
    const sampleNumber = parseInt(sampleInput);
    const index = annotationsData.sample.indexOf(sampleNumber);
    if (index !== -1) {
      setOriginalSymbol(annotationsData.symbol[index]);
      setEditSymbol(annotationsData.symbol[index]);
    } else {
      setOriginalSymbol('');
      setEditSymbol('');
    }
  };

  const updateAnnotationSymbol = () => {
    const sampleNumber = parseInt(sampleInput);
    const index = annotationsData.sample.indexOf(sampleNumber);
    if (index !== -1) {
      const updatedAnnotations = { ...annotationsData };
      updatedAnnotations.symbol[index] = editSymbol;
      setAnnotationsData(updatedAnnotations);
    }
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

  if (!ecgData.length || !annotationsData.sample.length) {
    return <div>Loading...</div>;
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
    labels: Array.from({ length: customRange.end - customRange.start }, (_, i) => i + customRange.start),
    datasets: [
      {
        label: 'ECG Waveform',
        data: ecgData.slice(customRange.start, customRange.end),
        borderColor: 'blue',
        borderWidth: 1,
        pointRadius: 0,
      },
      {
        label: 'Annotations',
        data: filteredAnnotations.filter(item => item.x >= customRange.start && item.x < customRange.end),
        pointBackgroundColor: 'red',
        pointRadius: 3,
        type: 'scatter',
      }
    ],
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

      {/* Custom Range Input */}
      <div>
        <label>Start: <input type="number" name="start" value={customRange.start} onChange={updateCustomRange} /></label>
        <label>End: <input type="number" name="end" value={customRange.end} onChange={updateCustomRange} /></label>
      </div>

      <Line data={chartData} options={{ responsive: true }} />

      {/* Edit Annotations by Sample Number */}
      <div>
        <h3>Edit Annotations by Sample Number</h3>
        <label>
          Sample Number: <input type="number" value={sampleInput} onChange={(e) => setSampleInput(e.target.value)} />
          <button onClick={handleSampleInput}>Load Symbol</button>
        </label>
        {originalSymbol && (
          <div>
            <p>Original Symbol: {originalSymbol}</p>
            <label>
              Edit Symbol: <input type="text" value={editSymbol} onChange={(e) => setEditSymbol(e.target.value)} />
              <button onClick={updateAnnotationSymbol}>Update Symbol</button>
            </label>
          </div>
        )}
      </div>

      {/* Save Button */}
      <button onClick={saveAnnotationsToFile}>Save Changes</button>
    </div>
  );
};

export default ECGChart;
