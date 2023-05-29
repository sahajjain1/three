import React, { useEffect, useRef } from 'react';

const FireworksCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let fireworkArray = [];
    let particleArray = [];

    function Firework(x, y, height, yVol, R, G, B) {
      this.x = x;
      this.y = y;
      this.yVol = yVol;
      this.height = height;
      this.R = R;
      this.G = G;
      this.B = B;
      this.radius = 1;
      this.boom = false;
      var boomHeight = Math.floor(Math.random() * 150) + 50;

      this.draw = function () {
        ctx.fillStyle = `rgba(${R}, ${G}, ${B})`;
        ctx.strokeStyle = `rgba(${R}, ${G}, ${B})`;
        ctx.beginPath();
        ctx.arc(this.x, boomHeight, this.radius, Math.PI * 2, 0, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, Math.PI * 2, 0, false);
        ctx.fill();
      };

      this.update = function () {
        this.y -= this.yVol;
        if (this.radius < 20) {
          this.radius += 0.35;
        }
        if (this.y < boomHeight) {
          this.boom = true;

          for (var i = 0; i < 120; i++) {
            particleArray.push(
              new Particle(
                this.x,
                this.y,
                (Math.random() * 2) + 1,
                this.R,
                this.G,
                this.B,
                1,
              )
            );
          }
        }
        this.draw();
      };

      this.update();
    }

    function Particle(x, y, radius, R, G, B, A) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.R = R;
      this.G = G;
      this.B = B;
      this.A = A;
      this.timer = 0;
      this.fade = false;
      this.xVol = (Math.random() * 10) - 4;
      this.yVol = (Math.random() * 10) - 4;

      this.draw = function () {
        ctx.fillStyle = `rgba(${R}, ${G}, ${B}, ${this.A})`;
        ctx.save();
        ctx.beginPath();
        ctx.globalCompositeOperation = 'screen';
        ctx.arc(this.x, this.y, this.radius, Math.PI * 2, 0, false);
        ctx.fill();
        ctx.restore();
      };

      this.update = function () {
        this.x += this.xVol;
        this.y += this.yVol;

        if (this.timer < 200) {
          this.yVol += 0.12;
        }
        this.A -= 0.02;
        if (this.A < 0) {
          this.fade = true;
        }
        this.draw();
      };

      this.update();
    }

    const animate = () => {
      requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < fireworkArray.length; i++) {
        fireworkArray[i].update();
      }
      for (var j = 0; j < particleArray.length; j++) {
        particleArray[j].update();
      }
      if (fireworkArray.length < 4) {
        var x = Math.random() * canvas.width;
        var y = canvas.height;
        var height = Math.floor(Math.random() * 10);
        var yVol = 5;
        var R = Math.floor(Math.random() * 255);
        var G = Math.floor(Math.random() * 255);
        var B = Math.floor(Math.random() * 255);
        fireworkArray.push(new Firework(x, y, height, yVol, R, G, B));
      }

      fireworkArray = fireworkArray.filter((obj) => !obj.boom);
      particleArray = particleArray.filter((obj) => !obj.fade);
    };

    animate();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    return () => {
      window.removeEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100vh', backgroundColor: 'transparent' }} />;
};

export default FireworksCanvas;
