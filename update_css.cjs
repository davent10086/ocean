const fs = require('fs');

const cssFile = 'src/index.css';
let css = fs.readFileSync(cssFile, 'utf8');

// Replace from .login-pet { to @keyframes pet-float { ... } }
const startIdx = css.indexOf('.login-pet {');
const endMarker = '@keyframes pet-float {';
const endBlockIdx = css.indexOf('}', css.indexOf('}', css.indexOf(endMarker)) + 1) + 1;

const newCss = `
.owl-pet {
  --pupil-x: 0px;
  --pupil-y: 0px;
  position: relative;
  width: min(100%, 480px);
  aspect-ratio: 1.2;
  min-height: 280px;
  border-radius: 40px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}

.owl-body {
  position: relative;
  width: 160px;
  height: 180px;
  background: #3b82f6;
  border-radius: 80px 80px 60px 60px;
  box-shadow: inset -10px -10px 20px rgba(0,0,0,0.1), 0 10px 30px rgba(59, 130, 246, 0.2);
  transition: transform 0.3s ease;
  z-index: 2;
}

.owl-pet.is-sleeping .owl-body {
  transform: translateY(10px) scaleY(0.95);
}

.owl-ear {
  position: absolute;
  top: -15px;
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 35px solid #3b82f6;
  z-index: 1;
}
.owl-ear-left {
  left: 15px;
  transform: rotate(-20deg);
}
.owl-ear-right {
  right: 15px;
  transform: rotate(20deg);
}

.owl-belly {
  position: absolute;
  bottom: 10px;
  left: 20px;
  right: 20px;
  height: 90px;
  background: #eef7ff;
  border-radius: 50px 50px 45px 45px;
  box-shadow: inset 0 5px 10px rgba(0,0,0,0.05);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 15px;
  gap: 10px;
}

.owl-feather {
  width: 12px;
  height: 6px;
  border-radius: 0 0 12px 12px;
  border-bottom: 2px solid #bae6fd;
}

.owl-glasses {
  position: absolute;
  top: 45px;
  left: 15px;
  right: 15px;
  display: flex;
  justify-content: space-between;
  z-index: 3;
}
.owl-glasses::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 4px;
  background: #1e3a8a;
}

.owl-eye {
  width: 54px;
  height: 54px;
  background: white;
  border: 4px solid #1e3a8a;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 3px 6px rgba(0,0,0,0.1);
}

.owl-pupil {
  width: 24px;
  height: 24px;
  background: #0f172a;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(calc(-50% + var(--pupil-x)), calc(-50% + var(--pupil-y)));
  transition: transform 100ms ease-out;
}
.owl-pupil::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.owl-pet.is-sleeping .owl-eye {
  background: #e0f2fe;
}
.owl-pet.is-sleeping .owl-pupil {
  opacity: 0;
}
.owl-pet.is-sleeping .owl-eye::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 8px;
  right: 8px;
  height: 4px;
  background: #1e3a8a;
  border-radius: 2px;
  transform: translateY(-50%);
}

.owl-beak {
  position: absolute;
  top: 85px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 14px solid #f59e0b;
  z-index: 4;
}

.owl-wing {
  position: absolute;
  top: 70px;
  width: 30px;
  height: 60px;
  background: #2563eb;
  border-radius: 15px;
  z-index: 1;
  transition: transform 0.3s ease;
}
.owl-wing-left {
  left: -12px;
  transform-origin: top right;
  transform: rotate(15deg);
}
.owl-wing-right {
  right: -12px;
  transform-origin: top left;
  transform: rotate(-15deg);
}
.owl-pet.is-sleeping .owl-wing-left {
  transform: rotate(5deg);
}
.owl-pet.is-sleeping .owl-wing-right {
  transform: rotate(-5deg);
}

.owl-book {
  position: absolute;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 28px;
  background: #1e40af;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
  z-index: 5;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}
.owl-book-page {
  width: 34px;
  height: 20px;
  background: white;
  border-radius: 2px;
}
.owl-book-page.left { border-radius: 3px 0 0 3px; }
.owl-book-page.right { border-radius: 0 3px 3px 0; }
.owl-book-bookmark {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 16px;
  background: #ef4444;
  border-radius: 1px;
}

.owl-snores {
  position: absolute;
  right: -20px;
  top: -10px;
  color: #60a5fa;
  font-size: 28px;
  font-weight: 700;
  font-family: sans-serif;
  letter-spacing: 2px;
  animation: pet-float 1.5s ease-in-out infinite;
  z-index: 6;
}

@keyframes pet-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
`;

css = css.substring(0, startIdx) + newCss.trim() + '\n' + css.substring(endBlockIdx);

// Remove the media query overrides for .login-pet in index.css
const mqStart = css.indexOf('@media (max-width: 960px)');
const mediaCss = css.substring(mqStart);

const newMediaCss = mediaCss.replace(/\s*\.login-pet \{[\s\S]*?\.pet-feet \{[\s\S]*?\}/, '');
css = css.substring(0, mqStart) + newMediaCss;

fs.writeFileSync(cssFile, css);
console.log('CSS Replaced successfully');