"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function GenerativeArtEffect() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isHidden = 
    (pathname.startsWith('/blogs/') && pathname !== '/blogs') ||
    pathname.startsWith('/photos') ||
    pathname.startsWith('/artworks');

  useEffect(() => {
    if (!mounted || isHidden) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    let animationFrameId: number;

    const mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 150,
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };

    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };
    
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      activeHue: number;
      colorLife: number;

      constructor(x: number, y: number, directionX: number, directionY: number, size: number) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.activeHue = 0;
        this.colorLife = 0;
      }

      draw() {
        if (!ctx) return;
        const isDark = document.documentElement.classList.contains("dark");
        const baseColor = isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)";
        let colorToUse = baseColor;
        
        if (this.colorLife > 0) {
          colorToUse = `hsla(${this.activeHue}, 80%, 60%, 0.7)`;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = colorToUse;
        ctx.fill();
      }

      update() {
        if (!canvas) return;
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

        if (this.colorLife > 0) this.colorLife--;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius + this.size) {
            if (mouse.x < this.x && this.x < canvas.width - this.size * 10) this.x += 1.5;
            if (mouse.x > this.x && this.x > this.size * 10) this.x -= 1.5;
            if (mouse.y < this.y && this.y < canvas.height - this.size * 10) this.y += 1.5;
            if (mouse.y > this.y && this.y > this.size * 10) this.y -= 1.5;

            if (this.colorLife === 0 && Math.random() < 0.1) {
              this.activeHue = Math.floor(Math.random() * 360);
              this.colorLife = 150; 
            }
          }
        }
        
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    function init() {
      if (!canvas) return;
      particlesArray = [];
      let numberOfParticles = (canvas.height * canvas.width) / 18000;
      
      if (numberOfParticles > 60) numberOfParticles = 60; 

      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 1.5 + 0.5;
        const x = Math.random() * (innerWidth - size * 2 - size * 2) + size * 2;
        const y = Math.random() * (innerHeight - size * 2 - size * 2) + size * 2;
        const directionX = (Math.random() * 0.2) - 0.1;
        const directionY = (Math.random() * 0.2) - 0.1;
        
        particlesArray.push(new Particle(x, y, directionX, directionY, size));
      }
    }

    function connect() {
      if (!ctx) return;
      let opacityValue = 1;
      const isDark = document.documentElement.classList.contains("dark");
      
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const distance = 
            ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) + 
            ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            
          if (distance < (canvas!.width / 8) * (canvas!.height / 8)) {
            opacityValue = 1 - (distance / 25000);
            if (opacityValue > 0.08) opacityValue = 0.08; 
            
            if (particlesArray[a].colorLife > 0) {
              ctx.strokeStyle = `hsla(${particlesArray[a].activeHue}, 80%, 60%, ${opacityValue * 4})`;
            } else if (particlesArray[b].colorLife > 0) {
              ctx.strokeStyle = `hsla(${particlesArray[b].activeHue}, 80%, 60%, ${opacityValue * 4})`;
            } else {
              ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${opacityValue})` : `rgba(0, 0, 0, ${opacityValue})`;
            }

            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (!canvas || !ctx) return;
      animationFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      connect();
    }

    resizeCanvas();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, [mounted, isHidden]);

  if (isHidden) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{
        display: "block",
        width: "100vw",
        height: "100vh"
      }}
    />
  );
}
