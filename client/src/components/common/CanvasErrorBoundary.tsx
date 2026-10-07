import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as THREE from 'three';

interface CanvasErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  is3DChild?: boolean;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

/**
 * 🛡️ CanvasErrorBoundary
 * Protects React Three Fiber WebGL tree from crashing when any 3D asset,
 * shader, texture, or model encounters an error or network drop.
 */
export class CanvasErrorBoundary extends Component<CanvasErrorBoundaryProps, CanvasErrorBoundaryState> {
  constructor(props: CanvasErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): CanvasErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'WebGL 3D Telemetry Render Exception',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[ASTRAVEX 3D Telemetry Guard] Caught WebGL render exception:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // If used INSIDE a Three.js Canvas tree (R3F elements)
      if (this.props.is3DChild) {
        return (
          <group position={[0, 0, 0]}>
            {/* Fallback procedural ground grid */}
            <gridHelper args={[40, 40, '#38bdf8', '#1e293b']} position={[0, -0.01, 0]} />
            
            {/* Soft emergency ambient light */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} color="#38bdf8" />
            
            {/* Holographic Wireframe Fallback Box */}
            <mesh position={[0, 0.75, 0]}>
              <boxGeometry args={[1.8, 1.2, 2.4]} />
              <meshStandardMaterial color="#38bdf8" wireframe opacity={0.6} transparent />
            </mesh>
          </group>
        );
      }

      // If used OUTSIDE Canvas (DOM overlay recovery)
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-6">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-cyan-400/30 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <span className="font-mono text-xl font-bold">⚠️</span>
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white font-orbitron">
                TELEMETRY RECOVERY MODE
              </h2>
              <p className="text-xs text-slate-300 font-mono">
                {this.state.errorMessage || 'WebGL stream encountered an unexpected interrupt.'}
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-glow-cyan cursor-pointer"
            >
              RESTORE 3D TELEMETRY STREAM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CanvasErrorBoundary;
