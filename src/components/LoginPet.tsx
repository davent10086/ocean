import type { CSSProperties, KeyboardEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { feedback } from '../services/feedback';

interface LoginPetProps {
  sleeping: boolean;
}

interface EyeOffset {
  x: number;
  y: number;
}

const MAX_PUPIL_OFFSET = 7;

export function LoginPet({ sleeping }: LoginPetProps) {
  const petRef = useRef<HTMLDivElement | null>(null);
  const [eyeOffset, setEyeOffset] = useState<EyeOffset>({ x: 0, y: 0 });
  const [isPopping, setIsPopping] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const pet = petRef.current;

      if (!pet || sleeping) {
        setEyeOffset({ x: 0, y: 0 });
        return;
      }

      const rect = pet.getBoundingClientRect();
      const faceCenterX = rect.left + rect.width / 2;
      const faceCenterY = rect.top + rect.height * 0.42;
      const deltaX = event.clientX - faceCenterX;
      const deltaY = event.clientY - faceCenterY;
      const distance = Math.hypot(deltaX, deltaY) || 1;
      const scale = Math.min(MAX_PUPIL_OFFSET, distance) / distance;

      setEyeOffset({
        x: Number((deltaX * scale).toFixed(2)),
        y: Number((deltaY * scale).toFixed(2)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [sleeping]);

  const pupilStyle = useMemo(
    () =>
      ({
        '--pupil-x': `${eyeOffset.x}px`,
        '--pupil-y': `${eyeOffset.y}px`,
      }) as CSSProperties,
    [eyeOffset],
  );

  useEffect(() => {
    if (!isPopping) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsPopping(false);
    }, 420);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isPopping]);

  const handlePetClick = () => {
    setIsPopping(true);
    feedback.success('关注塔菲喵，关注塔菲谢谢喵。');
  };

  const handlePetKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    handlePetClick();
  };

  return (
    <div className="pet-stage">
      <div className="pet-bubble">
        <span className="pet-bubble-dot" />
        {sleeping ? '嘘，馆长小猫头鹰在守护你的密码。' : '嗨，我是蓝海书库的猫头鹰馆长。'}
      </div>
      <div
        ref={petRef}
        className={`owl-pet ${sleeping ? 'is-sleeping' : ''} ${isPopping ? 'is-popping' : ''}`}
        style={pupilStyle}
        role="button"
        tabIndex={0}
        aria-label="点击猫头鹰查看提示"
        onClick={handlePetClick}
        onKeyDown={handlePetKeyDown}
      >
        <div className="owl-body" aria-hidden="true">
          <div className="owl-ear owl-ear-left" />
          <div className="owl-ear owl-ear-right" />
          
          <div className="owl-wing owl-wing-left" />
          <div className="owl-wing owl-wing-right" />

          <div className="owl-belly">
            <span className="owl-feather" />
            <span className="owl-feather" />
            <span className="owl-feather" />
          </div>

          <div className="owl-glasses">
            <div className="owl-eye">
              <span className="owl-pupil" />
            </div>
            <div className="owl-eye">
              <span className="owl-pupil" />
            </div>
          </div>

          <div className="owl-beak" />

          <div className="owl-book">
            <span className="owl-book-page left" />
            <span className="owl-book-page right" />
            <span className="owl-book-bookmark" />
          </div>
        </div>

        {sleeping ? <div className="owl-snores" aria-hidden="true">zZ</div> : null}
      </div>
    </div>
  );
}
