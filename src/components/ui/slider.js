import React from 'react';

export const Slider = (props) => {
  return (
    <input
      type="range"
      {...props}
    />
  );
};