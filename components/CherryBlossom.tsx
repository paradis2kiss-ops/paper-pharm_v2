import React from 'react';

const PETAL_COUNT = 20;

const CherryBlossom: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {Array.from({ length: PETAL_COUNT }).map((_, i) => {
        const style = {
          left: `${Math.random() * 100}vw`,
          width: `${Math.random() * 8 + 7}px`,
          height: `${Math.random() * 5 + 5}px`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${Math.random() * 8 + 7}s`,
          '--sway': Math.random() * 100 - 50,
          '--rot': Math.random() * 360,
        } as React.CSSProperties;

        return <div key={i} className="petal" style={style} />;
      })}
    </div>
  );
};

export default CherryBlossom;
