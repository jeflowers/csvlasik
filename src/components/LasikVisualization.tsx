// src/components/LasikVisualization.tsx
import React, { useRef, useEffect, useState } from 'react';

interface LasikVisualizationProps {
  procedure: 'lasik' | 'prk' | 'icl';
}

const LasikVisualization: React.FC<LasikVisualizationProps> = ({ procedure }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const procedureSteps = {
    lasik: [
      { id: 1, label: 'Prepare Eye', description: 'Numbing drops applied' },
      { id: 2, label: 'Create Flap', description: 'Femtosecond laser creates corneal flap' },
      { id: 3, label: 'Reshape Cornea', description: 'Excimer laser reshapes cornea' },
      { id: 4, label: 'Replace Flap', description: 'Flap repositioned naturally' }
    ],
    prk: [
      { id: 1, label: 'Remove Epithelium', description: 'Surface layer removed' },
      { id: 2, label: 'Reshape Cornea', description: 'Excimer laser treatment' },
      { id: 3, label: 'Apply Bandage', description: 'Protective contact lens' },
      { id: 4, label: 'Healing', description: 'Epithelium regenerates' }
    ],
    icl: [
      { id: 1, label: 'Small Incision', description: 'Tiny opening created' },
      { id: 2, label: 'Insert ICL', description: 'Lens carefully positioned' },
      { id: 3, label: 'Position Behind Iris', description: 'Lens unfolds naturally' },
      { id: 4, label: 'Complete', description: 'Works with natural lens' }
    ]
  };

  useEffect(() => {
    // Initialize your Three.js scene here
    if (canvasRef.current) {
      // Your Three.js initialization code
      console.log(`Initializing ${procedure} visualization`);
    }
  }, [procedure]);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    // Animate to the specific step in your 3D visualization
    console.log(`Animating to step ${step}`);
  };

  return (
    <div className="visualization-container bg-gray-50 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        How {procedure.toUpperCase()} Works
      </h2>
      
      <div className="canvas-wrapper relative bg-white rounded-lg shadow-lg overflow-hidden" 
           style={{ height: '400px' }}>
        <canvas 
          ref={canvasRef}
          className="w-full h-full"
          style={{ background: 'linear-gradient(135deg, #E6F2FF, #B3D9FF)' }}
        />
        
        {/* Placeholder for your 3D eye model */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-2">👁️</div>
            <p className="text-gray-600">3D Visualization Loading...</p>
          </div>
        </div>
      </div>

      <div className="step-controls mt-6">
        <div className="flex justify-between items-center mb-4">
          {procedureSteps[procedure].map((step) => (
            <button
              key={step.id}
              onClick={() => handleStepChange(step.id)}
              className={`flex-1 mx-1 py-2 px-3 rounded-lg font-medium transition-all ${
                currentStep === step.id
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div className="text-xs mb-1">Step {step.id}</div>
              <div className="text-sm">{step.label}</div>
            </button>
          ))}
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 font-medium">
            Step {currentStep}: {procedureSteps[procedure][currentStep - 1].label}
          </p>
          <p className="text-blue-600 text-sm mt-1">
            {procedureSteps[procedure][currentStep - 1].description}
          </p>
        </div>
      </div>

      <div className="controls mt-4 flex justify-center gap-4">
        <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          ↻ Rotate
        </button>
        <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          🔍 Zoom
        </button>
        <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          ▶️ Play Animation
        </button>
      </div>
    </div>
  );
};

export default LasikVisualization;
