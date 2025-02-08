import React from "react";
import styled from "styled-components";

const CheckboxWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 28px;
  height: 28px;

  input[type="checkbox"] {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    margin: 0;
    opacity: 0;
    appearance: none;
    -webkit-appearance: none;

    &:hover {
      cursor: pointer;
    }

    &:checked + svg {
      .background {
        fill: #f4c430;
      }
      .stroke {
        stroke-dashoffset: 0;
      }
      .check {
        stroke-dashoffset: 0;
      }
    }
  }

  svg {
    width: 100%;
    height: 100%;

    .background {
      fill: #ccc;
      transition: ease all 0.6s;
    }

    .stroke {
      fill: none;
      stroke: #fff;
      stroke-miterlimit: 10;
      stroke-width: 2px;
      stroke-dashoffset: 100;
      stroke-dasharray: 100;
      transition: ease all 0.6s;
    }

    .check {
      fill: none;
      stroke: #fff;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 2px;
      stroke-dashoffset: 22;
      stroke-dasharray: 22;
      transition: ease all 0.6s;
    }
  }

  &:hover .check {
    stroke-dashoffset: 0;
  }
`;

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
}) => (
  <CheckboxWrapper>
    <input type="checkbox" checked={checked} onChange={onChange} />
    <svg viewBox="0 0 35.6 35.6">
      <circle className="background" cx="17.8" cy="17.8" r="17.8" />
      <circle className="stroke" cx="17.8" cy="17.8" r="14.37" />
      <polyline
        className="check"
        points="11.78 18.12 15.55 22.23 25.17 12.87"
      />
    </svg>
  </CheckboxWrapper>
);

export default CustomCheckbox;
