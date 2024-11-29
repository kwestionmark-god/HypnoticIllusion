import React from 'react';

export const Switch = (props) => {
  return (
    <label className="switch">
      <input
        type="checkbox"
        {...props}
      />
      <span className="slider"></span>
    </label>
  );
};