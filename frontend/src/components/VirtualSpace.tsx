import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { Event, SponsorDeal, FeedbackAnswer, FeedbackQuestion } from "../types";

// Modern color palette with gradients
const colors = {
  primary: "#4F46E5", // Indigo
  primaryDark: "#4338CA",
  primaryLight: "#EEF2FF",
  primaryGradient: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
  secondary: "#EC4899", // Pink
  secondaryLight: "#FCE7F3",
  secondaryGradient: "linear-gradient(135deg, #EC4899 0%, #BE185D 100%)",
  accent: "#06B6D4", // Cyan
  accentLight: "#CFFAFE",
  accentGradient: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
  success: "#10B981", // Green
  successLight: "#D1FAE5",
  successGradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
  error: "#EF4444", // Red
  errorLight: "#FEE2E2",
  warning: "#F59E0B", // Amber
  warningLight: "#FEF3C7",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  borderLight: "#E5E7EB",
  backgroundLight: "#FFFFFF",
  backgroundSecondary: "#F9FAFB",
  backgroundTertiary: "#F3F4F6",
  shadow: "rgba(0, 0, 0, 0.05)",
  shadowMedium: "rgba(0, 0, 0, 0.1)",
  glass: "rgba(255, 255, 255, 0.8)",
  glassCard: "rgba(255, 255, 255, 0.7)",
  darkGlass: "rgba(0, 0, 0, 0.7)",
};

// Modern typography
const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

// Design tokens with improved mobile spacing
const designTokens = {
  borderRadius: {
    sm: "0.375rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
  },
  animation: {
    fast: "0.2s ease",
    medium: "0.3s ease",
    slow: "0.5s ease",
  },
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  // Add responsive breakpoints
  breakpoints: {
    sm: "480px",
    md: "768px",
    lg: "1024px",
  },
};

const SpaceWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${colors.backgroundSecondary};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  font-size: 16px;
  color: ${colors.textPrimary};
  scroll-behavior: smooth;
  padding-bottom: env(safe-area-inset-bottom, 0);

  /* Mobile-first approach - base styles are for mobile */
  font-size: 16px;

  /* Then adjust for larger screens */
  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 16px;
  }
`;

const HeaderCard = styled.div<{ posterUrl?: string }>`
  width: 100%;
  height: 35vh; /* Reduced height for mobile */
  min-height: 250px;
  background-color: #000;
  background-image: ${(props) =>
    props.posterUrl ? `url(${props.posterUrl})` : colors.primaryGradient};
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.8) 100%
    );
    z-index: 0;
  }

  /* Modern curved bottom edge */
  &::before {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 24px;
    background: ${colors.backgroundSecondary};
    border-radius: 24px 24px 0 0;
    z-index: 1;
  }

  /* Increase height on larger screens */
  @media (min-width: ${designTokens.breakpoints.md}) {
    height: 40vh;
    min-height: 280px;

    &::before {
      height: 32px;
      border-radius: 32px 32px 0 0;
    }
  }
`;

const HeaderContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${designTokens.spacing.xl} ${designTokens.spacing.lg};
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: ${designTokens.spacing.sm};

  /* Add more padding on larger screens */
  @media (min-width: ${designTokens.breakpoints.md}) {
    padding: ${designTokens.spacing.xxl} ${designTokens.spacing.xl};
  }
`;

const WelcomeText = styled.h1`
  color: white;
  font-size: 28px;
  font-weight: ${fontWeights.bold};
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
  letter-spacing: -0.5px;

  /* Increase size on larger screens */
  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 34px;
  }
`;

const EventName = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  margin: 0 0 ${designTokens.spacing.md};
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-weight: ${fontWeights.medium};
  max-width: 100%;

  /* Adjust for larger screens */
  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 20px;
    margin: 0 0 ${designTokens.spacing.lg};
    max-width: 90%;
  }
`;

const ContentSection = styled.div`
  padding: ${designTokens.spacing.lg} ${designTokens.spacing.md};
  flex: 1;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
  margin-bottom: 32px;
  /* Add more padding on larger screens */
  @media (min-width: ${designTokens.breakpoints.md}) {
    padding: ${designTokens.spacing.xl} ${designTokens.spacing.lg};
    max-width: 800px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${designTokens.spacing.md};
  padding: 0 ${designTokens.spacing.xs};

  /* Add more margin on larger screens */
  @media (min-width: ${designTokens.breakpoints.md}) {
    margin-bottom: ${designTokens.spacing.lg};
    padding: 0 ${designTokens.spacing.sm};
  }
`;

const SectionTitle = styled.h2`
  color: ${colors.textPrimary};
  font-size: 22px;
  font-weight: ${fontWeights.bold};
  margin: 0;
  position: relative;
  display: flex;
  align-items: center;

  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 32px;
    height: 3px;
    background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
    border-radius: ${designTokens.borderRadius.full};
  }

  /* Adjust for larger screens */
  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 24px;

    &::after {
      width: 40px;
    }
  }
`;

// Modern card with subtle shadow - more touch-friendly
const Card = styled.div`
  background-color: ${colors.backgroundLight};
  border-radius: ${designTokens.borderRadius.lg};
  box-shadow: ${designTokens.shadows.md};
  overflow: hidden;
  margin-bottom: ${designTokens.spacing.lg};
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: transform ${designTokens.animation.medium},
    box-shadow ${designTokens.animation.medium};

  /* Remove hover effect on mobile for better touch experience */
  @media (min-width: ${designTokens.breakpoints.md}) {
    margin-bottom: ${designTokens.spacing.xl};

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${designTokens.shadows.lg};
    }
  }
`;

// Modern schedule container - with enhanced styling
const ScheduleContainer = styled.div`
  margin-bottom: ${designTokens.spacing.lg};
  background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
  border-radius: ${designTokens.borderRadius.lg};
  padding: ${designTokens.spacing.lg};
  box-shadow: ${designTokens.shadows.lg};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.12) 0%,
        rgba(255, 255, 255, 0) 50%
      ),
      linear-gradient(
        235deg,
        rgba(255, 255, 255, 0.08) 0%,
        rgba(255, 255, 255, 0) 60%
      );
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    pointer-events: none;
    z-index: 0;
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    margin-bottom: ${designTokens.spacing.xl};
    padding: ${designTokens.spacing.xl};
  }
`;

// Modern schedule item - mobile-first design
const ScheduleItem = styled.div<{ isActive?: boolean }>`
  display: flex;
  flex-direction: column;
  padding: ${designTokens.spacing.lg} ${designTokens.spacing.md};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  background-color: ${(props) =>
    props.isActive ? "rgba(255, 255, 255, 0.18)" : "rgba(255, 255, 255, 0.08)"};
  transition: all ${designTokens.animation.fast};
  border-radius: ${designTokens.borderRadius.md};
  margin-bottom: ${designTokens.spacing.md};
  backdrop-filter: blur(4px);
  position: relative;
  z-index: 1;
  box-shadow: ${(props) =>
    props.isActive
      ? "0 4px 12px rgba(0, 0, 0, 0.1)"
      : "0 2px 6px rgba(0, 0, 0, 0.05)"};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.22);
    transform: translateY(1px);
  }

  /* Switch to row layout on larger screens */
  @media (min-width: ${designTokens.breakpoints.md}) {
    flex-direction: row;
    padding: ${designTokens.spacing.lg};
  }
`;

const ScheduleItemHeader = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${designTokens.spacing.md};

  @media (min-width: ${designTokens.breakpoints.md}) {
    margin-bottom: 0;
  }
`;

const ScheduleIconContainer = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${designTokens.borderRadius.full};
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${designTokens.spacing.md};
  flex-shrink: 0;
  font-size: 22px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #4338ca;

  @media (min-width: ${designTokens.breakpoints.md}) {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
`;

const ScheduleContent = styled.div`
  flex: 1;
  min-width: 0; // Ensures text truncation works properly
  display: flex;
  flex-direction: column;
  gap: ${designTokens.spacing.sm};
`;

const ScheduleTitle = styled.h3`
  color: white;
  font-size: 18px;
  font-weight: ${fontWeights.semibold};
  margin: 0;
  line-height: 1.3;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);

  @media (min-width: ${designTokens.breakpoints.md}) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: -0.3px;
  }
`;

const ScheduleDescription = styled.p`
  color: rgba(255, 255, 255, 0.85);
  font-size: 16px;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 15px;
    -webkit-line-clamp: 2;
    line-height: 1.5;
  }
`;

const ScheduleDetails = styled.p`
  color: rgba(255, 255, 255, 0.75);
  font-size: 16px;
  margin: ${designTokens.spacing.xs} 0 0;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: ${designTokens.spacing.xs};

  &::before {
    content: "📍";
    font-size: 16px;
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 14px;

    &::before {
      font-size: 14px;
    }
  }
`;

const ScheduleTimeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: ${designTokens.spacing.md};

  @media (min-width: ${designTokens.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-start;
    margin-left: auto;
    margin-top: 0;
    padding-left: ${designTokens.spacing.lg};
    min-width: 90px;
    width: auto;
  }
`;

const ScheduleTime = styled.div`
  color: rgba(255, 255, 255, 0.95);
  font-size: 16px;
  font-weight: ${fontWeights.medium};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${designTokens.spacing.xs};

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 15px;
  }
`;

const DateBadge = styled.div<{
  isToday?: boolean;
  isTomorrow?: boolean;
  isMultiDay?: boolean;
}>`
  font-size: 14px;
  font-weight: ${fontWeights.medium};
  padding: 4px 10px;
  border-radius: ${designTokens.borderRadius.full};
  background-color: ${(props) =>
    props.isToday
      ? "rgba(255, 255, 255, 0.22)"
      : props.isTomorrow
      ? "rgba(236, 72, 153, 0.22)"
      : props.isMultiDay
      ? "rgba(6, 182, 212, 0.22)"
      : "rgba(255, 255, 255, 0.12)"};
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 12px;
    padding: 3px 10px;
    margin-top: ${designTokens.spacing.sm};
  }
`;

const MultiDayBadge = styled.span`
  font-size: 12px;
  font-weight: ${fontWeights.medium};
  padding: 3px 8px;
  border-radius: ${designTokens.borderRadius.sm};
  margin-left: ${designTokens.spacing.sm};
  background-color: rgba(6, 182, 212, 0.22);
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 11px;
    padding: 2px 6px;
  }
`;

const TimeIcon = styled.span`
  margin-right: ${designTokens.spacing.xs};
  font-size: 16px;

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 14px;
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.7)
  );
  border-radius: 0 ${designTokens.borderRadius.sm}
    ${designTokens.borderRadius.sm} 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  @media (min-width: ${designTokens.breakpoints.md}) {
    width: 4px;
  }
`;

// Modern form elements
const FormGroup = styled.div`
  margin-bottom: ${designTokens.spacing.xl};
`;

const Label = styled.label`
  display: block;
  color: ${colors.textSecondary};
  font-size: 16px;
  font-weight: ${fontWeights.medium};
  margin-bottom: ${designTokens.spacing.md};
  padding-left: ${designTokens.spacing.xs};

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 14px;
    margin-bottom: ${designTokens.spacing.sm};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: ${designTokens.spacing.lg};
  border: 1px solid ${colors.borderLight};
  border-radius: ${designTokens.borderRadius.md};
  font-size: 18px;
  transition: all ${designTokens.animation.fast};
  box-sizing: border-box;
  background-color: ${colors.backgroundLight};
  color: ${colors.textPrimary};
  box-shadow: ${designTokens.shadows.sm};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  height: 56px; /* Set explicit height for better touch target */

  &::placeholder {
    color: ${colors.textTertiary};
    opacity: 0.8;
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 16px;
    padding: ${designTokens.spacing.md} ${designTokens.spacing.lg};
    height: auto;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 160px;
  padding: ${designTokens.spacing.lg};
  border: 1px solid ${colors.borderLight};
  border-radius: ${designTokens.borderRadius.md};
  font-size: 18px;
  resize: none;
  transition: all ${designTokens.animation.fast};
  box-sizing: border-box;
  background-color: ${colors.backgroundLight};
  color: ${colors.textPrimary};
  box-shadow: ${designTokens.shadows.sm};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;

  &::placeholder {
    color: ${colors.textTertiary};
    opacity: 0.8;
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 16px;
    padding: ${designTokens.spacing.md} ${designTokens.spacing.lg};
    height: 140px;
  }
`;

// Modern button
const Button = styled.button`
  background: ${colors.primaryGradient};
  color: white;
  border: none;
  border-radius: ${designTokens.borderRadius.md};
  padding: ${designTokens.spacing.lg};
  box-sizing: border-box;
  font-size: 18px;
  font-weight: ${fontWeights.semibold};
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${designTokens.animation.medium};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  box-shadow: ${designTokens.shadows.md};
  position: relative;
  overflow: hidden;
  height: 56px; /* Set explicit height for better touch target */
  margin-bottom: 32px;
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0)
    );
    opacity: 0;
    transition: opacity ${designTokens.animation.fast};
  }

  &:active {
    transform: translateY(1px);
    box-shadow: ${designTokens.shadows.sm};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 16px;
    padding: ${designTokens.spacing.md} ${designTokens.spacing.lg};
    height: auto;

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${designTokens.shadows.lg};

      &::before {
        opacity: 1;
      }
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: ${designTokens.spacing.lg};
  background: ${colors.backgroundSecondary};
  padding: ${designTokens.spacing.lg};
  text-align: center;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid rgba(79, 70, 229, 0.1);
  border-radius: 50%;
  border-top-color: ${colors.primary};
  animation: spin 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  box-shadow: ${designTokens.shadows.md};

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: ${colors.textSecondary};
  font-size: 16px;
  font-weight: ${fontWeights.medium};
  margin: 0;
`;

const ErrorMessage = styled.div`
  color: ${colors.error};
  background-color: ${colors.errorLight};
  padding: ${designTokens.spacing.lg};
  border-radius: ${designTokens.borderRadius.lg};
  text-align: center;
  margin: ${designTokens.spacing.lg};
  font-size: 16px;
  box-shadow: ${designTokens.shadows.md};
  border: 1px solid rgba(239, 68, 68, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designTokens.spacing.md};

  &::before {
    content: "⚠️";
    font-size: 28px;
    margin-bottom: ${designTokens.spacing.sm};
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    margin: ${designTokens.spacing.xl};
  }
`;

const SuccessMessage = styled.div`
  position: fixed;
  bottom: ${designTokens.spacing.lg};
  left: 50%;
  transform: translateX(-50%);
  background: ${colors.successGradient};
  color: white;
  padding: ${designTokens.spacing.md} ${designTokens.spacing.lg};
  border-radius: ${designTokens.borderRadius.md};
  font-size: 16px;
  font-weight: ${fontWeights.medium};
  box-shadow: ${designTokens.shadows.lg};
  animation: slideUp 0.4s ${designTokens.animation.medium} forwards;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: ${designTokens.spacing.sm};
  min-width: 280px;
  text-align: center;
  justify-content: center;
  width: calc(100% - 32px);
  max-width: 400px;

  &::before {
    content: "✓";
    font-weight: bold;
    font-size: 18px;
    background: rgba(255, 255, 255, 0.2);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translate(-50%, 20px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    bottom: ${designTokens.spacing.xl};
    width: auto;
  }
`;

// Sponsor deals section - mobile-first design
const BannersContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: ${designTokens.breakpoints.md}) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }
`;

const Banner = styled.div<{ backgroundImage: string }>`
  position: relative;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  background-image: url(${(props) => props.backgroundImage});
  background-size: cover;
  background-position: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  @media (min-width: ${designTokens.breakpoints.md}) {
    height: 180px;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }
  }
`;

const BannerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.1) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  box-sizing: border-box;
  color: white;
  opacity: 1;

  @media (min-width: ${designTokens.breakpoints.md}) {
    opacity: 0;
    transition: opacity 0.3s ease;

    ${Banner}:hover & {
      opacity: 1;
    }
  }
`;

const BannerTitle = styled.h3`
  font-size: 18px;
  font-weight: ${fontWeights.semibold};
  margin: 0 0 8px 0;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const BannerDescription = styled.p`
  font-size: 14px;
  margin: 0 0 16px 0;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BannerButton = styled.a`
  position: absolute;
  bottom: 16px;
  right: 16px;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  box-sizing: border-box;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s ease;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #4f46e5;
  }

  &:active {
    background-color: #4338ca;
    transform: translateY(1px);
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    padding: 8px 16px;
    font-size: 14px;
  }
`;

// Custom popup components
const PopupBackdrop = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: ${(props) => (props.isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  box-sizing: border-box;
  backdrop-filter: blur(3px);
  transition: opacity 0.3s ease;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
`;

// Base popup container with shared styles
const PopupContainer = styled.div`
  background-color: white;
  border-radius: 16px;
  width: 95%;
  max-width: 500px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  animation: popupFadeIn 0.3s ease forwards;
  transform-origin: center;
  max-height: 90vh;

  @keyframes popupFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    width: 90%;
    max-height: none;
  }
`;

// Popup with description
const DescriptionPopup = styled(PopupContainer)`
  min-height: 500px;

  @media (min-width: ${designTokens.breakpoints.md}) {
    min-height: 450px;
  }
`;

// Popup without description
const SimplePopup = styled(PopupContainer)`
  min-height: 450px;

  @media (min-width: ${designTokens.breakpoints.md}) {
    min-height: 400px;
  }
`;

// Popup header with image
const PopupHeader = styled.div<{ hasDescription: boolean }>`
  position: relative;
  width: 100%;
  padding-top: ${(props) => (props.hasDescription ? "60%" : "90%")};
  background-size: cover;
  background-position: center;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;

  @media (min-width: ${designTokens.breakpoints.md}) {
    padding-top: ${(props) => (props.hasDescription ? "56.25%" : "75%")};
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.3) 100%
    );
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
  }
`;

// Popup content area
const PopupContent = styled.div<{ hasDescription: boolean }>`
  padding: ${(props) => (props.hasDescription ? "25px 20px" : "30px 20px")};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  ${(props) =>
    props.hasDescription
      ? `
    justify-content: space-between;
    text-align: left;
  `
      : `
    justify-content: center;
    text-align: center;
    align-items: center;
  `}

  @media (min-width: ${designTokens.breakpoints.md}) {
    padding: ${(props) => (props.hasDescription ? "30px" : "25px")};
  }
`;

// Popup title
const PopupTitle = styled.h2<{ hasDescription: boolean }>`
  font-size: ${(props) => (props.hasDescription ? "22px" : "24px")};
  font-weight: ${fontWeights.semibold};
  color: ${colors.textPrimary};
  margin: 0 0 ${(props) => (props.hasDescription ? "15px" : "25px")} 0;

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: ${(props) => (props.hasDescription ? "24px" : "26px")};
    margin: 0 0 ${(props) => (props.hasDescription ? "20px" : "30px")} 0;
  }
`;

// Popup description
const PopupDescription = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: ${colors.textSecondary};
  margin: 0 0 25px 0;

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 16px;
    margin: 0 0 30px 0;
  }
`;

// Popup button
const PopupButton = styled.a<{ hasDescription: boolean }>`
  display: inline-block;
  background-color: ${colors.primary};
  color: white;
  font-weight: ${fontWeights.medium};
  padding: 16px 24px;
  box-sizing: border-box;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  transition: all 0.2s ease;
  font-size: ${(props) => (props.hasDescription ? "16px" : "18px")};
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  width: 100%;

  @media (min-width: ${designTokens.breakpoints.md}) {
    padding: 14px 32px;
    font-size: 16px;
    ${(props) =>
      props.hasDescription
        ? "align-self: flex-start; width: auto;"
        : "width: 100%;"}
  }

  &:hover {
    background-color: ${colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
  }
`;

// Close button
const PopupCloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background-color: white;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(1);
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 16px;
    height: 2px;
    background-color: ${colors.textPrimary};
  }

  &::before {
    transform: rotate(45deg);
  }

  &::after {
    transform: rotate(-45deg);
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    top: 16px;
    right: 16px;
  }
`;

// Helper function to ensure URLs have the correct format
const formatUrl = (url: string): string => {
  // Check if the URL already starts with http:// or https://
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Add https:// prefix if missing
  return `https://${url}`;
};

// Define schedule item type
interface ScheduleItem {
  id: number;
  title: string;
  startDateTime: string; // ISO string format
  endDateTime: string; // ISO string format
  location: string;
  icon: string;
  description?: string;
  // Keep time field for backward compatibility, but it will be deprecated
  time?: string;
}

const SectionDivider = styled.div`
  height: 8px;
  margin: ${designTokens.spacing.lg} 0;
  background: ${colors.backgroundTertiary};
  border-radius: ${designTokens.borderRadius.full};
  width: 100%;
  opacity: 0.6;

  @media (min-width: ${designTokens.breakpoints.md}) {
    margin: ${designTokens.spacing.xl} 0;
  }
`;

const EmptyStateMessage = styled.div`
  text-align: center;
  padding: ${designTokens.spacing.xl};
  color: white;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designTokens.spacing.md};
  position: relative;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: ${designTokens.borderRadius.lg};
  backdrop-filter: blur(4px);
  margin: ${designTokens.spacing.md};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  &::before {
    content: "📅";
    font-size: 36px;
    margin-bottom: ${designTokens.spacing.sm};
    background: rgba(255, 255, 255, 0.15);
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }
`;

const FormTitle = styled.h2`
  font-size: 24px;
  font-weight: ${fontWeights.bold};
  margin-bottom: 12px;
  color: ${colors.textPrimary};
`;

const FormDescription = styled.p`
  font-size: 16px;
  margin-bottom: 24px;
  color: ${colors.textSecondary};
`;

const QuestionLabel = styled.label`
  display: block;
  font-weight: ${fontWeights.medium};
  margin-bottom: 8px;
  color: ${colors.textPrimary};
`;

const RequiredMark = styled.span`
  color: ${colors.error};
  margin-left: 4px;
`;

const RatingContainer = styled.div`
  margin: 16px 0;
  width: 100%;
`;

const RatingButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0;
  width: 100%;
  justify-content: center;

  @media (min-width: ${designTokens.breakpoints.md}) {
    gap: 12px;
  }
`;

const RatingRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  width: 100%;

  @media (min-width: ${designTokens.breakpoints.md}) {
    gap: 12px;
  }
`;

const RatingButton = styled.button<{ isSelected: boolean }>`
  width: 42px;
  height: 42px;
  border-radius: ${designTokens.borderRadius.full};
  border: 2px solid
    ${(props) => (props.isSelected ? colors.primary : colors.borderLight)};
  background-color: ${(props) =>
    props.isSelected ? colors.primary : colors.backgroundLight};
  color: ${(props) => (props.isSelected ? "white" : colors.textPrimary)};
  font-weight: ${fontWeights.semibold};
  font-size: 16px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  transition: all ${designTokens.animation.fast};
  box-shadow: ${(props) =>
    props.isSelected ? designTokens.shadows.md : designTokens.shadows.sm};

  &:hover {
    background-color: ${(props) =>
      props.isSelected ? colors.primary : colors.primaryLight};
    color: ${(props) => (props.isSelected ? "white" : colors.primary)};
    transform: translateY(-2px);
    box-shadow: ${designTokens.shadows.md};
  }

  &:active {
    transform: translateY(1px);
    box-shadow: ${designTokens.shadows.sm};
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
`;

const RatingLabelsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 8px;
`;

const RatingLabel = styled.span`
  font-size: 14px;
  color: ${colors.textSecondary};
  font-weight: ${fontWeights.medium};

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 15px;
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 12px 0;
  width: 100%;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: ${designTokens.borderRadius.md};
  border: 1px solid ${colors.borderLight};
  background-color: ${colors.backgroundLight};
  transition: all ${designTokens.animation.fast};
  box-shadow: ${designTokens.shadows.sm};

  &:hover {
    border-color: ${colors.primary};
    box-shadow: ${designTokens.shadows.md};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: ${designTokens.shadows.sm};
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    padding: 14px 18px;
  }
`;

const CustomRadioContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 16px;
  flex-shrink: 0;

  @media (min-width: ${designTokens.breakpoints.md}) {
    width: 26px;
    height: 26px;
  }
`;

const CustomRadio = styled.div<{ isSelected?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: ${designTokens.borderRadius.full};
  border: 2px solid
    ${(props) => (props.isSelected ? colors.primary : colors.borderLight)};
  background-color: ${colors.backgroundLight};
  position: relative;
  transition: all ${designTokens.animation.fast};

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${(props) => (props.isSelected ? "12px" : "0")};
    height: ${(props) => (props.isSelected ? "12px" : "0")};
    border-radius: ${designTokens.borderRadius.full};
    background-color: ${colors.primary};
    transition: all ${designTokens.animation.fast};
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    width: 26px;
    height: 26px;

    &::after {
      width: ${(props) => (props.isSelected ? "14px" : "0")};
      height: ${(props) => (props.isSelected ? "14px" : "0")};
    }
  }
`;

const CustomCheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 16px;
  flex-shrink: 0;

  @media (min-width: ${designTokens.breakpoints.md}) {
    width: 26px;
    height: 26px;
  }
`;

const CustomCheckbox = styled.div<{ isSelected?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: ${designTokens.borderRadius.md};
  border: 2px solid
    ${(props) => (props.isSelected ? colors.primary : colors.borderLight)};
  background-color: ${(props) =>
    props.isSelected ? colors.primary : colors.backgroundLight};
  position: relative;
  transition: all ${designTokens.animation.fast};

  &::after {
    content: ${(props) => (props.isSelected ? '"✓"' : '""')};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 16px;
    font-weight: ${fontWeights.bold};
  }

  @media (min-width: ${designTokens.breakpoints.md}) {
    width: 26px;
    height: 26px;

    &::after {
      font-size: 18px;
    }
  }
`;

const RadioInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const CheckboxInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const OptionLabel = styled.label`
  font-size: 16px;
  color: ${colors.textPrimary};
  cursor: pointer;
  flex: 1;

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 17px;
  }
`;

const RankingContainer = styled.div`
  margin: 16px 0;
  width: 100%;
`;

const RankingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  width: 100%;
`;

const RankingItem = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-radius: ${designTokens.borderRadius.md};
  border: 1px solid ${colors.borderLight};
  background-color: ${colors.backgroundLight};
  transition: all ${designTokens.animation.fast};
  box-shadow: ${designTokens.shadows.sm};
  position: relative;

  @media (min-width: ${designTokens.breakpoints.md}) {
    padding: 16px 18px;
  }
`;

const RankingNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${designTokens.borderRadius.full};
  background-color: ${colors.primary};
  color: white;
  font-weight: ${fontWeights.semibold};
  margin-right: 16px;
  flex-shrink: 0;

  @media (min-width: ${designTokens.breakpoints.md}) {
    width: 32px;
    height: 32px;
  }
`;

const RankingText = styled.div`
  font-size: 16px;
  color: ${colors.textPrimary};
  flex: 1;

  @media (min-width: ${designTokens.breakpoints.md}) {
    font-size: 17px;
  }
`;

const RankingControls = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 12px;
`;

const RankingButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${designTokens.borderRadius.full};
  border: 1px solid ${colors.borderLight};
  background-color: ${colors.backgroundLight};
  color: ${colors.textPrimary};
  cursor: pointer;
  transition: all ${designTokens.animation.fast};

  &:hover {
    background-color: ${colors.primaryLight};
    color: ${colors.primary};
    transform: translateY(-2px);
    box-shadow: ${designTokens.shadows.sm};
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      background-color: ${colors.backgroundLight};
      color: ${colors.textPrimary};
      transform: none;
      box-shadow: none;
    }
  }
`;

const RankingInstructions = styled.p`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin-bottom: 12px;
  font-style: italic;
`;

const VirtualSpace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [feedback, setFeedback] = useState(""); // Keep for backward compatibility
  const [answers, setAnswers] = useState<FeedbackAnswer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<SponsorDeal | null>(null);
  const [isDealPopupVisible, setIsDealPopupVisible] = useState(false);
  const [currentTime] = useState(new Date());

  // Schedule state - initialize with empty array
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  // Add a ref for the popup
  const popupRef = useRef<HTMLDivElement>(null);

  // Add meta viewport tag for better mobile experience
  useEffect(() => {
    // Set viewport meta tag for better mobile experience
    const metaViewport = document.createElement("meta");
    metaViewport.name = "viewport";
    metaViewport.content =
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
    document.head.appendChild(metaViewport);

    // Add status bar color for iOS
    const metaStatusBar = document.createElement("meta");
    metaStatusBar.name = "apple-mobile-web-app-status-bar-style";
    metaStatusBar.content = "black-translucent";
    document.head.appendChild(metaStatusBar);

    // Add web app capable meta for iOS
    const metaWebApp = document.createElement("meta");
    metaWebApp.name = "apple-mobile-web-app-capable";
    metaWebApp.content = "yes";
    document.head.appendChild(metaWebApp);

    // Clean up on unmount
    return () => {
      document.head.removeChild(metaViewport);
      document.head.removeChild(metaStatusBar);
      document.head.removeChild(metaWebApp);
    };
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/events/${id}`
        );
        const fetchedEvent = response.data.data;

        // Initialize sponsorDeals if it doesn't exist
        if (!fetchedEvent.emailParams.sponsorDeals) {
          fetchedEvent.emailParams.sponsorDeals = {
            enabled: false,
            content: "",
            items: [],
          };
        }

        setEvent(fetchedEvent);

        // Set schedule items if they exist
        if (
          fetchedEvent.emailParams.scheduleSrc &&
          fetchedEvent.emailParams.scheduleSrc.items
        ) {
          setSchedule(fetchedEvent.emailParams.scheduleSrc.items);
        }

        // Initialize answers when the event (and its feedback form) is loaded
        if (fetchedEvent.feedbackForm?.questions) {
          const initialAnswers: FeedbackAnswer[] = [];

          for (const question of fetchedEvent.feedbackForm.questions) {
            const newAnswer: FeedbackAnswer = {
              questionId: question.id,
            };

            if (question.type === "text") {
              newAnswer.textAnswer = "";
            } else if (question.type === "rating") {
              newAnswer.ratingAnswer = question.minRating || 0;
            } else if (
              question.type === "single_choice" ||
              question.type === "multiple_choice"
            ) {
              newAnswer.selectedOptions = [];
            } else if (question.type === "ranking") {
              newAnswer.rankingOrder = [];
            }

            initialAnswers.push(newAnswer);
          }

          setAnswers(initialAnswers);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event data. Please try again later.");
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(e.target.value);
  };

  const handleGuestNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestName(e.target.value);
  };

  const handleGuestEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestEmail(e.target.value);
  };

  const handleSubmitFeedback = async () => {
    // Handle legacy feedback form
    if (!event?.feedbackForm) {
      if (!feedback.trim()) {
        alert("Please enter your feedback before submitting.");
        return;
      }

      try {
        setSubmitting(true);
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/events/${id}/feedback`,
          {
            guestName: guestName.trim() || undefined,
            content: feedback.trim(),
          }
        );

        if (response.data.success) {
          setSubmitSuccess(true);
          setFeedback("");
          setGuestName("");

          // Reset success message after 3 seconds
          setTimeout(() => {
            setSubmitSuccess(false);
          }, 3000);
        }
      } catch (err) {
        console.error("Error submitting feedback:", err);
        alert("Failed to submit feedback. Please try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Handle structured feedback form
    // Validate answers
    if (!answers.length) {
      alert("Please fill out the feedback form before submitting.");
      return;
    }

    // Check if required questions are answered
    const requiredQuestions =
      event.feedbackForm.questions.filter((q) => q.required) || [];
    const unansweredRequired = requiredQuestions.filter((question) => {
      const answer = answers.find((a) => a.questionId === question.id);
      if (!answer) return true;

      switch (question.type) {
        case "text":
          return !answer.textAnswer || answer.textAnswer.trim() === "";
        case "rating":
          return answer.ratingAnswer === undefined;
        case "single_choice":
        case "multiple_choice":
          return !answer.selectedOptions || answer.selectedOptions.length === 0;
        case "ranking":
          return !answer.rankingOrder || answer.rankingOrder.length === 0;
        default:
          return true;
      }
    });

    if (unansweredRequired.length > 0) {
      alert(`Please answer all required questions before submitting.`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/events/${id}/feedback`,
        {
          guestName: guestName.trim() || undefined,
          guestEmail: guestEmail.trim() || undefined,
          answers: answers,
        }
      );

      if (response.data.success) {
        setSubmitSuccess(true);
        // Reset form
        setGuestName("");
        setGuestEmail("");

        // Reset answers
        if (event.feedbackForm.questions) {
          const initialAnswers: FeedbackAnswer[] = [];

          for (const question of event.feedbackForm.questions) {
            const newAnswer: FeedbackAnswer = {
              questionId: question.id,
            };

            if (question.type === "text") {
              newAnswer.textAnswer = "";
            } else if (question.type === "rating") {
              newAnswer.ratingAnswer = question.minRating || 0;
            } else if (
              question.type === "single_choice" ||
              question.type === "multiple_choice"
            ) {
              newAnswer.selectedOptions = [];
            } else if (question.type === "ranking") {
              newAnswer.rankingOrder = [];
            }

            initialAnswers.push(newAnswer);
          }

          setAnswers(initialAnswers);
        }

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Add handlers for different question types
  const handleTextAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, textAnswer: value }
          : answer
      )
    );
  };

  const handleRatingAnswerChange = (questionId: string, value: number) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, ratingAnswer: value }
          : answer
      )
    );
  };

  const handleSingleChoiceChange = (questionId: string, optionId: string) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, selectedOptions: [optionId] }
          : answer
      )
    );
  };

  const handleMultipleChoiceChange = (
    questionId: string,
    optionId: string,
    checked: boolean
  ) => {
    setAnswers((prev) =>
      prev.map((answer) => {
        if (answer.questionId !== questionId) return answer;

        const currentOptions = answer.selectedOptions || [];
        let newOptions;

        if (checked) {
          newOptions = [...currentOptions, optionId];
        } else {
          newOptions = currentOptions.filter((id) => id !== optionId);
        }

        return { ...answer, selectedOptions: newOptions };
      })
    );
  };

  // Helper function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Helper function to check if a date is tomorrow
  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    );
  };

  // Helper function to check if two dates are on the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Helper function to format date and time
  const formatTimeRange = (item: ScheduleItem) => {
    // If we have startDateTime and endDateTime, use them
    if (item.startDateTime && item.endDateTime) {
      const start = new Date(item.startDateTime);
      const end = new Date(item.endDateTime);

      const formatTime = (date: Date) => {
        return date.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      // If same day, just show time range
      if (isSameDay(start, end)) {
        return formatTime(start) + " - " + formatTime(end);
      }

      // If different days, show abbreviated format
      return formatTime(start) + " - " + formatTime(end);
    }

    // Fallback to time field for backward compatibility
    return item.time || "";
  };

  // Helper function to get date badge text
  const getDateBadgeText = (startDateTime: string, endDateTime: string) => {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const sameDay = isSameDay(start, end);

    if (isToday(start)) {
      return sameDay ? "Today" : "Starts Today";
    }

    if (isTomorrow(start)) {
      return sameDay ? "Tomorrow" : "Starts Tomorrow";
    }

    // Return formatted date for other days
    const formattedDate = start.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    return sameDay ? formattedDate : `From ${formattedDate}`;
  };

  // Helper function to check if a session is currently active
  const isSessionActive = (sessionTime: string, item?: ScheduleItem) => {
    // If we have startDateTime and endDateTime, use them
    if (item && item.startDateTime && item.endDateTime) {
      const sessionStart = new Date(item.startDateTime);
      const sessionEnd = new Date(item.endDateTime);

      return currentTime >= sessionStart && currentTime <= sessionEnd;
    }

    // Legacy format handling
    if (!sessionTime) return false;

    try {
      // Extract start and end times
      const [start, end] = sessionTime.split(" - ");

      // Parse hours and minutes
      const [startHour, startMin] = start.split(":").map(Number);
      const [endHour, endMin] = end.split(":").map(Number);

      // Create Date objects for comparison
      const sessionStart = new Date();
      sessionStart.setHours(startHour, startMin, 0);

      const sessionEnd = new Date();
      sessionEnd.setHours(endHour, endMin, 0);

      return currentTime >= sessionStart && currentTime <= sessionEnd;
    } catch (error) {
      console.error("Error parsing session time:", error);
      return false;
    }
  };

  // Add a function to handle opening the deal popup
  const handleDealClick = (deal: SponsorDeal) => {
    setSelectedDeal(deal);
    setIsDealPopupVisible(true);
    // Prevent body scrolling when popup is open
    document.body.style.overflow = "hidden";
  };

  // Add a function to close the deal popup
  const closeDealPopup = () => {
    setIsDealPopupVisible(false);
    // Restore body scrolling when popup is closed
    document.body.style.overflow = "auto";
  };

  // Add a function to handle clicks outside the popup
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
      closeDealPopup();
    }
  };

  // Clean up body style on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Add a handler for ranking questions
  const handleRankingChange = (
    questionId: string,
    optionId: string,
    direction: "up" | "down"
  ) => {
    setAnswers((prev) => {
      return prev.map((answer) => {
        if (answer.questionId !== questionId) return answer;

        // Get current ranking order or initialize if empty
        const currentOrder = answer.rankingOrder || [];

        // If the option is not in the ranking yet, add it at the end
        if (!currentOrder.includes(optionId)) {
          return { ...answer, rankingOrder: [...currentOrder, optionId] };
        }

        // Find the current index of the option
        const currentIndex = currentOrder.indexOf(optionId);

        // Create a new array to avoid mutating the original
        const newOrder = [...currentOrder];

        if (direction === "up" && currentIndex > 0) {
          // Move up: swap with the previous item
          [newOrder[currentIndex], newOrder[currentIndex - 1]] = [
            newOrder[currentIndex - 1],
            newOrder[currentIndex],
          ];
        } else if (
          direction === "down" &&
          currentIndex < currentOrder.length - 1
        ) {
          // Move down: swap with the next item
          [newOrder[currentIndex], newOrder[currentIndex + 1]] = [
            newOrder[currentIndex + 1],
            newOrder[currentIndex],
          ];
        }

        return { ...answer, rankingOrder: newOrder };
      });
    });
  };

  // Add a handler to add an option to the ranking
  const handleAddToRanking = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      return prev.map((answer) => {
        if (answer.questionId !== questionId) return answer;

        // Get current ranking order or initialize if empty
        const currentOrder = answer.rankingOrder || [];

        // If the option is already in the ranking, don't add it again
        if (currentOrder.includes(optionId)) {
          return answer;
        }

        // Add the option to the end of the ranking
        return { ...answer, rankingOrder: [...currentOrder, optionId] };
      });
    });
  };

  // Add a handler to remove an option from the ranking
  const handleRemoveFromRanking = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      return prev.map((answer) => {
        if (answer.questionId !== questionId) return answer;

        // Get current ranking order or initialize if empty
        const currentOrder = answer.rankingOrder || [];

        // Remove the option from the ranking
        return {
          ...answer,
          rankingOrder: currentOrder.filter((id) => id !== optionId),
        };
      });
    });
  };

  if (loading) {
    return (
      <SpaceWrapper>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading your virtual space...</LoadingText>
        </LoadingContainer>
      </SpaceWrapper>
    );
  }

  if (error || !event) {
    return (
      <SpaceWrapper>
        <ErrorMessage>
          {error || "Event not found. Please check the URL and try again."}
        </ErrorMessage>
      </SpaceWrapper>
    );
  }

  return (
    <SpaceWrapper>
      <HeaderCard posterUrl={event.poster || undefined}>
        <HeaderContent>
          <WelcomeText>Welcome!</WelcomeText>
          <EventName>This is your Virtual Space for {event.title}</EventName>
        </HeaderContent>
      </HeaderCard>

      <ContentSection>
        <SectionHeader>
          <SectionTitle>Schedule</SectionTitle>
        </SectionHeader>

        <ScheduleContainer>
          {schedule.length === 0 ? (
            <EmptyStateMessage>
              No schedule items available for this event.
            </EmptyStateMessage>
          ) : (
            schedule.map((item) => {
              const start = new Date(item.startDateTime);
              const end = new Date(item.endDateTime);
              const sameDay = isSameDay(start, end);
              const isActive = isSessionActive(item.time || "", item);
              const isStartToday = isToday(start);
              const isStartTomorrow = isTomorrow(start);

              return (
                <ScheduleItem key={item.id} isActive={isActive}>
                  {isActive && <ActiveIndicator />}
                  <ScheduleItemHeader>
                    <ScheduleIconContainer>{item.icon}</ScheduleIconContainer>
                    <ScheduleContent>
                      <ScheduleTitle>
                        {item.title}
                        {!sameDay && <MultiDayBadge>Multi-day</MultiDayBadge>}
                      </ScheduleTitle>
                      {item.description && (
                        <ScheduleDescription>
                          {item.description}
                        </ScheduleDescription>
                      )}
                      <ScheduleDetails>{item.location}</ScheduleDetails>
                    </ScheduleContent>
                  </ScheduleItemHeader>

                  <ScheduleTimeContainer>
                    <ScheduleTime>
                      <TimeIcon>🕒</TimeIcon>
                      {formatTimeRange(item)}
                    </ScheduleTime>
                    {item.startDateTime && (
                      <DateBadge
                        isToday={isStartToday}
                        isTomorrow={isStartTomorrow}
                        isMultiDay={!sameDay}
                      >
                        {getDateBadgeText(item.startDateTime, item.endDateTime)}
                      </DateBadge>
                    )}
                  </ScheduleTimeContainer>
                </ScheduleItem>
              );
            })
          )}
        </ScheduleContainer>

        {event.emailParams.sponsorDeals?.items &&
          event.emailParams.sponsorDeals.items.length > 0 && (
            <>
              <SectionDivider />

              <SectionHeader>
                <SectionTitle>Check out our sponsors!</SectionTitle>
              </SectionHeader>

              <Card>
                <BannersContainer>
                  {event.emailParams.sponsorDeals.items.map((deal) => (
                    <Banner
                      key={deal.id}
                      backgroundImage={deal.imageSrc}
                      onClick={() => handleDealClick(deal)}
                    >
                      <BannerOverlay>
                        <BannerTitle>{deal.title}</BannerTitle>
                        {deal.description && (
                          <BannerDescription>
                            {deal.description}
                          </BannerDescription>
                        )}
                      </BannerOverlay>
                      <BannerButton
                        as="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDealClick(deal);
                        }}
                        title={deal.description || deal.title}
                      >
                        {deal.title.includes("Learn")
                          ? "Learn More"
                          : "View Deal"}
                      </BannerButton>
                    </Banner>
                  ))}
                </BannersContainer>
              </Card>
            </>
          )}

        <SectionDivider />

        <SectionHeader>
          <SectionTitle>Feedback</SectionTitle>
        </SectionHeader>

        <Card style={{ padding: `${designTokens.spacing.lg}` }}>
          {submitSuccess && (
            <SuccessMessage>Feedback submitted successfully!</SuccessMessage>
          )}

          {event?.feedbackForm ? (
            <>
              <FormTitle>{event.feedbackForm.title}</FormTitle>
              {event.feedbackForm.description && (
                <FormDescription>
                  {event.feedbackForm.description}
                </FormDescription>
              )}

              <FormGroup>
                <Label>Your Name (optional)</Label>
                <Input
                  value={guestName}
                  onChange={handleGuestNameChange}
                  placeholder="Enter your name"
                />
              </FormGroup>

              <FormGroup>
                <Label>Your Email (optional)</Label>
                <Input
                  value={guestEmail}
                  onChange={handleGuestEmailChange}
                  placeholder="Enter your email"
                  type="email"
                />
              </FormGroup>

              {event.feedbackForm.questions.map(
                (question: FeedbackQuestion) => (
                  <FormGroup key={question.id}>
                    <QuestionLabel>
                      {question.title}
                      {question.required && <RequiredMark>*</RequiredMark>}
                    </QuestionLabel>

                    {question.type === "text" && (
                      <TextArea
                        value={
                          answers.find((a) => a.questionId === question.id)
                            ?.textAnswer || ""
                        }
                        onChange={(e) =>
                          handleTextAnswerChange(question.id, e.target.value)
                        }
                        placeholder="Your answer..."
                      />
                    )}

                    {question.type === "rating" && (
                      <RatingContainer>
                        <RatingLabelsContainer>
                          {question.minLabel && (
                            <RatingLabel>{question.minLabel}</RatingLabel>
                          )}
                          {question.maxLabel && (
                            <RatingLabel>{question.maxLabel}</RatingLabel>
                          )}
                        </RatingLabelsContainer>
                        <RatingButtonsContainer>
                          <RatingRow>
                            {(() => {
                              const minRating = question.minRating || 0;
                              const maxRating = question.maxRating || 10;
                              const totalNumbers = maxRating - minRating + 1;
                              const firstRowLength = Math.ceil(
                                totalNumbers / 2
                              );

                              return Array.from(
                                { length: firstRowLength },
                                (_, i) => {
                                  const value = minRating + i;
                                  const isSelected =
                                    answers.find(
                                      (a) => a.questionId === question.id
                                    )?.ratingAnswer === value;
                                  return (
                                    <RatingButton
                                      key={value}
                                      isSelected={isSelected}
                                      onClick={() =>
                                        handleRatingAnswerChange(
                                          question.id,
                                          value
                                        )
                                      }
                                    >
                                      {value}
                                    </RatingButton>
                                  );
                                }
                              );
                            })()}
                          </RatingRow>
                          <RatingRow>
                            {(() => {
                              const minRating = question.minRating || 0;
                              const maxRating = question.maxRating || 10;
                              const totalNumbers = maxRating - minRating + 1;
                              const firstRowLength = Math.ceil(
                                totalNumbers / 2
                              );
                              const secondRowLength = Math.floor(
                                totalNumbers / 2
                              );

                              return Array.from(
                                { length: secondRowLength },
                                (_, i) => {
                                  const value = minRating + firstRowLength + i;
                                  const isSelected =
                                    answers.find(
                                      (a) => a.questionId === question.id
                                    )?.ratingAnswer === value;
                                  return (
                                    <RatingButton
                                      key={value}
                                      isSelected={isSelected}
                                      onClick={() =>
                                        handleRatingAnswerChange(
                                          question.id,
                                          value
                                        )
                                      }
                                    >
                                      {value}
                                    </RatingButton>
                                  );
                                }
                              );
                            })()}
                          </RatingRow>
                        </RatingButtonsContainer>
                      </RatingContainer>
                    )}

                    {question.type === "single_choice" && question.options && (
                      <OptionsContainer>
                        {question.options.map((option) => {
                          const isSelected = !!answers
                            .find((a) => a.questionId === question.id)
                            ?.selectedOptions?.includes(option.id);
                          return (
                            <OptionItem key={option.id}>
                              <CustomRadioContainer>
                                <CustomRadio isSelected={isSelected} />
                              </CustomRadioContainer>
                              <RadioInput
                                type="radio"
                                id={`option-${option.id}`}
                                name={`question-${question.id}`}
                                checked={isSelected}
                                onChange={() =>
                                  handleSingleChoiceChange(
                                    question.id,
                                    option.id
                                  )
                                }
                              />
                              <OptionLabel htmlFor={`option-${option.id}`}>
                                {option.text}
                              </OptionLabel>
                            </OptionItem>
                          );
                        })}
                      </OptionsContainer>
                    )}

                    {question.type === "multiple_choice" &&
                      question.options && (
                        <OptionsContainer>
                          {question.options.map((option) => {
                            const isSelected = !!answers
                              .find((a) => a.questionId === question.id)
                              ?.selectedOptions?.includes(option.id);
                            return (
                              <OptionItem key={option.id}>
                                <CustomCheckboxContainer>
                                  <CustomCheckbox isSelected={isSelected} />
                                </CustomCheckboxContainer>
                                <CheckboxInput
                                  type="checkbox"
                                  id={`option-${option.id}`}
                                  checked={isSelected}
                                  onChange={(e) =>
                                    handleMultipleChoiceChange(
                                      question.id,
                                      option.id,
                                      e.target.checked
                                    )
                                  }
                                />
                                <OptionLabel htmlFor={`option-${option.id}`}>
                                  {option.text}
                                </OptionLabel>
                              </OptionItem>
                            );
                          })}
                        </OptionsContainer>
                      )}

                    {question.type === "ranking" && question.options && (
                      <RankingContainer>
                        <RankingInstructions>
                          Please rank the options by selecting them and using
                          the up/down arrows to arrange them in order of
                          preference.
                        </RankingInstructions>
                        {/* Show the current ranking */}
                        {(answers.find((a) => a.questionId === question.id)
                          ?.rankingOrder?.length ?? 0) > 0 ? (
                          <RankingList>
                            {answers
                              .find((a) => a.questionId === question.id)
                              ?.rankingOrder?.map((optionId, index) => {
                                const option = question.options?.find(
                                  (opt) => opt.id === optionId
                                );
                                if (!option) return null;

                                return (
                                  <RankingItem key={optionId}>
                                    <RankingNumber>{index + 1}</RankingNumber>
                                    <RankingText>{option.text}</RankingText>
                                    <RankingControls>
                                      <RankingButton
                                        onClick={() =>
                                          handleRankingChange(
                                            question.id,
                                            optionId,
                                            "up"
                                          )
                                        }
                                        disabled={index === 0}
                                        aria-label="Move up"
                                      >
                                        ↑
                                      </RankingButton>
                                      <RankingButton
                                        onClick={() =>
                                          handleRankingChange(
                                            question.id,
                                            optionId,
                                            "down"
                                          )
                                        }
                                        disabled={
                                          index ===
                                          (answers.find(
                                            (a) => a.questionId === question.id
                                          )?.rankingOrder?.length || 0) -
                                            1
                                        }
                                        aria-label="Move down"
                                      >
                                        ↓
                                      </RankingButton>
                                      <RankingButton
                                        onClick={() =>
                                          handleRemoveFromRanking(
                                            question.id,
                                            optionId
                                          )
                                        }
                                        aria-label="Remove"
                                      >
                                        ×
                                      </RankingButton>
                                    </RankingControls>
                                  </RankingItem>
                                );
                              })}
                          </RankingList>
                        ) : (
                          <p>
                            No options ranked yet. Select options below to add
                            them to your ranking.
                          </p>
                        )}

                        {/* Show unranked options */}
                        <h4 style={{ marginTop: "20px", marginBottom: "12px" }}>
                          Available Options
                        </h4>
                        <OptionsContainer>
                          {(question.options || [])
                            .filter(
                              (option) =>
                                !answers
                                  .find((a) => a.questionId === question.id)
                                  ?.rankingOrder?.includes(option.id)
                            )
                            .map((option) => (
                              <OptionItem
                                key={option.id}
                                onClick={() =>
                                  handleAddToRanking(question.id, option.id)
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <RankingText>{option.text}</RankingText>
                                <span style={{ color: colors.primary }}>
                                  + Add to ranking
                                </span>
                              </OptionItem>
                            ))}
                        </OptionsContainer>
                      </RankingContainer>
                    )}
                  </FormGroup>
                )
              )}

              <Button onClick={handleSubmitFeedback} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </>
          ) : (
            <>
              <FormGroup>
                <Label>Your Name (optional)</Label>
                <Input
                  value={guestName}
                  onChange={handleGuestNameChange}
                  placeholder="Enter your name"
                />
              </FormGroup>

              <FormGroup>
                <Label>Your Feedback</Label>
                <TextArea
                  value={feedback}
                  onChange={handleFeedbackChange}
                  placeholder="Let us know what you liked or disliked about the event..."
                />
              </FormGroup>

              <Button onClick={handleSubmitFeedback} disabled={submitting}>
                {submitting
                  ? "Submitting..."
                  : submitSuccess
                  ? "Thank you!"
                  : "Submit Feedback"}
              </Button>
            </>
          )}
        </Card>
      </ContentSection>

      {/* Custom popup implementation */}
      <PopupBackdrop isOpen={isDealPopupVisible} onClick={handleBackdropClick}>
        {selectedDeal &&
          (selectedDeal.description ? (
            <DescriptionPopup
              ref={popupRef}
              onClick={(e) => e.stopPropagation()}
            >
              <PopupCloseButton onClick={closeDealPopup} />
              <PopupHeader
                hasDescription={true}
                style={{ backgroundImage: `url(${selectedDeal.imageSrc})` }}
              />
              <PopupContent hasDescription={true}>
                <div>
                  <PopupTitle hasDescription={true}>
                    {selectedDeal.title}
                  </PopupTitle>
                  <PopupDescription>
                    {selectedDeal.description}
                  </PopupDescription>
                </div>
                <PopupButton
                  hasDescription={true}
                  href={formatUrl(selectedDeal.linkUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {selectedDeal.title.includes("Learn")
                    ? "Learn More"
                    : "View Deal"}
                </PopupButton>
              </PopupContent>
            </DescriptionPopup>
          ) : (
            <SimplePopup ref={popupRef} onClick={(e) => e.stopPropagation()}>
              <PopupCloseButton onClick={closeDealPopup} />
              <PopupHeader
                hasDescription={false}
                style={{ backgroundImage: `url(${selectedDeal.imageSrc})` }}
              />
              <PopupContent hasDescription={false}>
                <PopupTitle hasDescription={false}>
                  {selectedDeal.title}
                </PopupTitle>
                <PopupButton
                  hasDescription={false}
                  href={formatUrl(selectedDeal.linkUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {selectedDeal.title.includes("Learn")
                    ? "Learn More"
                    : "View Deal"}
                </PopupButton>
              </PopupContent>
            </SimplePopup>
          ))}
      </PopupBackdrop>
    </SpaceWrapper>
  );
};

export default VirtualSpace;
