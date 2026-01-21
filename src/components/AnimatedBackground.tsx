'use client';

import { useEffect, useRef } from 'react';
import styles from './AnimatedBackground.module.css';

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number, height: number;
    let orbs: Orb[] = [];
    const orbCount = 5;
    let animationFrameId: number;

    class Orb {
        x: number = 0;
        y: number = 0;
        vx: number = 0;
        vy: number = 0;
        radius: number = 0;
        color: string = '';

        constructor() {
            this.reset();
            // Start at random positions
            this.x = Math.random() * width;
            this.y = Math.random() * height;
        }

        reset() {
            this.radius = Math.random() * 300 + 200; // Large soft orbs
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Very slow movement
            this.vx = (Math.random() - 0.5) * 0.2; 
            this.vy = (Math.random() - 0.5) * 0.2;
            this.color = `hsla(${150 + Math.random() * 20}, 60%, 15%, 0.4)`; // Deep green hues
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Wrap around screen for seamless flow
            if (this.x < -this.radius) this.x = width + this.radius;
            if (this.x > width + this.radius) this.x = -this.radius;
            if (this.y < -this.radius) this.y = height + this.radius;
            if (this.y > height + this.radius) this.y = -this.radius;
        }

        draw() {
            if (!ctx) return;
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function resize() {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function init() {
        resize();
        orbs = [];
        for (let i = 0; i < orbCount; i++) {
            orbs.push(new Orb());
        }
    }

    function animate() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        // Composite operation to blend orbs beautifully
        ctx.globalCompositeOperation = 'screen'; 

        orbs.forEach(orb => {
            orb.update();
            orb.draw();
        });
        
        // Reset composite
        ctx.globalCompositeOperation = 'source-over';

        animationFrameId = requestAnimationFrame(animate);
    }

    const handleResize = () => {
        resize();
        init();
    };

    window.addEventListener('resize', handleResize);

    init();
    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={styles.container}>
        <canvas ref={canvasRef} className={styles.canvas}></canvas>
    </div>
  );
}
