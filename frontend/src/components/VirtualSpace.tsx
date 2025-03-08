import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { Event, SponsorDeal } from "../types";

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

  @media (max-width: ${designTokens.breakpoints.sm}) {
    font-size: 18px; /* Increase base font size for mobile */
  }
`;

const HeaderCard = styled.div<{ posterUrl?: string }>`
  width: 100%;
  height: 45vh;
  min-height: 280px;
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
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0.8) 100%
    );
    z-index: 0;
  }

  &::before {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 40px;
    background: ${colors.backgroundSecondary};
    border-radius: 40px 40px 0 0;
    z-index: 1;
  }

  @media (max-width: ${designTokens.breakpoints.sm}) {
    height: 35vh; /* Reduce header height on mobile */
  }
`;

const HeaderContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${designTokens.spacing.xxl} ${designTokens.spacing.xl};
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: ${designTokens.spacing.sm};

  @media (max-width: ${designTokens.breakpoints.sm}) {
    padding: ${designTokens.spacing.xl} ${designTokens.spacing.lg};
  }
`;

const WelcomeText = styled.h1`
  color: white;
  font-size: 34px;
  font-weight: ${fontWeights.bold};
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
  letter-spacing: -0.5px;

  @media (max-width: ${designTokens.breakpoints.sm}) {
    font-size: 32px; /* Increase from 28px for better readability */
  }
`;

const EventName = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 20px;
  margin: 0 0 ${designTokens.spacing.lg};
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-weight: ${fontWeights.medium};
  max-width: 90%;

  @media (max-width: ${designTokens.breakpoints.sm}) {
    font-size: 20px; /* Increase from 18px for better readability */
    margin-bottom: ${designTokens.spacing.md};
  }
`;

const ContentSection = styled.div`
  padding: ${designTokens.spacing.xl} ${designTokens.spacing.lg};
  flex: 1;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  z-index: 2;

  @media (max-width: ${designTokens.breakpoints.sm}) {
    padding: ${designTokens.spacing.lg} ${designTokens.spacing.md};
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${designTokens.spacing.lg};
  padding: 0 ${designTokens.spacing.sm};

  @media (max-width: ${designTokens.breakpoints.sm}) {
    margin-bottom: ${designTokens.spacing.md};
  }
`;

const SectionTitle = styled.h2`
  color: ${colors.textPrimary};
  font-size: 24px;
  font-weight: ${fontWeights.bold};
  margin: 0;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 3px;
    background: ${colors.primaryGradient};
    border-radius: ${designTokens.borderRadius.full};
  }

  @media (max-width: ${designTokens.breakpoints.sm}) {
    font-size: 22px; /* Increase from 20px for better readability */
  }
`;

// Modern card with subtle shadow
const Card = styled.div`
  background-color: ${colors.backgroundLight};
  border-radius: ${designTokens.borderRadius.lg};
  box-shadow: ${designTokens.shadows.md};
  overflow: hidden;
  margin-bottom: ${designTokens.spacing.xl};
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: transform ${designTokens.animation.medium},
    box-shadow ${designTokens.animation.medium};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${designTokens.shadows.lg};
  }

  @media (max-width: ${designTokens.breakpoints.sm}) {
    margin-bottom: ${designTokens.spacing.lg};
  }
`;

// Modern schedule container
const ScheduleContainer = styled.div`
  margin-bottom: ${designTokens.spacing.xl};

  @media (max-width: ${designTokens.breakpoints.sm}) {
    margin-bottom: ${designTokens.spacing.lg};
  }
`;

// Modern schedule item - improved for mobile
const ScheduleItem = styled.div<{ isActive?: boolean }>`
  display: flex;
  padding: ${designTokens.spacing.lg};
  border-bottom: 1px solid ${colors.borderLight};
  position: relative;
  background-color: ${(props) =>
    props.isActive ? colors.primaryLight : colors.backgroundLight};
  transition: all ${designTokens.animation.fast};

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: ${colors.backgroundTertiary};
  }

  @media (max-width: ${designTokens.breakpoints.sm}) {
    padding: ${designTokens.spacing.lg} ${designTokens.spacing.md}; /* Increase vertical padding */
    flex-direction: column; /* Stack elements vertically on mobile */
  }
`;

const ScheduleIconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${designTokens.borderRadius.md};
  background: ${colors.primaryGradient};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${designTokens.spacing.lg};
  flex-shrink: 0;
  font-size: 22px;
  box-shadow: ${designTokens.shadows.sm};
  color: white;

  @media (max-width: ${designTokens.breakpoints.sm}) {
    width: 48px; /* Keep icon size */
    height: 48px;
    font-size: 22px;
    margin-right: 0;
    margin-bottom: ${designTokens.spacing.md}; /* Add bottom margin */
    align-self: flex-start; /* Align to the start */
  }
`;

const ScheduleContent = styled.div`
  flex: 1;
  min-width: 0; // Ensures text truncation works properly
  display: flex;
  flex-direction: column;
  gap: ${designTokens.spacing.xs};

  @media (max-width: ${designTokens.breakpoints.sm}) {
    width: 100%;
    gap: ${designTokens.spacing.sm}; /* Increase gap between elements */
  }
`;

const ScheduleTitle = styled.h3`
  color: ${colors.textPrimary};
  font-size: 18px;
  font-weight: ${fontWeights.semibold};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.3px;

  @media (max-width: ${designTokens.breakpoints.sm}) {
    font-size: 20px; /* Increase from 16px for better readability */
    white-space: normal; /* Allow text to wrap */
    overflow: visible;
    text-overflow: clip;
    line-height: 1.3;
  }
`;

const ScheduleDescription = styled.p`
  color: ${colors.textSecondary};
  font-size: 15px;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: ${designTokens.breakpoints.sm}) {
    font-size: 16px; /* Increase from 14px for better readability */
    -webkit-line-clamp: 3;
    line-height: 1.4;
    margin-top: ${designTokens.spacing.xs};
  }
`;

const ScheduleDetails = styled.p`
  color: ${colors.textSecondary};
  font-size: 14px;
  margin: ${designTokens.spacing.xs} 0 0;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: ${designTokens.spacing.xs};

  &::before {
    content: "📍";
    font-size: 14px;
  }

  @media (max-width: ${designTokens.breakpoints.sm}) {
    font-size: 16px; /* Increase from 13px for better readability */
    margin-top: ${designTokens.spacing.sm};
  }
`;

const ScheduleTimeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: auto;
  padding-left: ${designTokens.spacing.lg};
  min-width: 90px;

  @media (max-width: ${designTokens.breakpoints.sm}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: ${designTokens.spacing.md};
    margin-left: 0;
    padding-left: 0;
    min-width: unset;
  }
`;

const ScheduleTime = styled.div`
  color: ${colors.primary};
  font-size: 15px;
  font-weight: ${fontWeights.medium};
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: ${designTokens.spacing.xs};

  @media (max-width: ${designTokens.breakpoints.sm}) {
    font-size: 16px; /* Increase from 14px for better readability */
  }
`;

const DateBadge = styled.div<{
  isToday?: boolean;
  isTomorrow?: boolean;
  isMultiDay?: boolean;
}>`
  font-size: 12px;
  font-weight: ${fontWeights.medium};
  padding: 3px 10px;
  border-radius: ${designTokens.borderRadius.full};
  margin-top: ${designTokens.spacing.sm};
  background-color: ${(props) =>
    props.isToday
      ? colors.primaryLight
      : props.isTomorrow
      ? colors.secondaryLight
      : props.isMultiDay
      ? colors.accentLight
      : colors.backgroundTertiary};
  color: ${(props) =>
    props.isToday
      ? colors.primary
      : props.isTomorrow
      ? colors.secondary
      : props.isMultiDay
      ? colors.accent
      : colors.textSecondary};

  @media (max-width: ${designTokens.breakpoints.sm}) {
    margin-top: 0;
    font-size: 14px; /* Increase from 11px for better readability */
    padding: 4px 10px; /* Increase padding for better touch target */
  }
`;

const MultiDayBadge = styled.span`
  font-size: 11px;
  font-weight: ${fontWeights.medium};
  padding: 2px 6px;
  border-radius: ${designTokens.borderRadius.sm};
  margin-left: ${designTokens.spacing.sm};
  background-color: ${colors.accentLight};
  color: ${colors.accent};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: ${designTokens.breakpoints.sm}) {
    font-size: 12px; /* Increase from 10px for better readability */
    padding: 3px 8px; /* Increase padding for better touch target */
    margin-left: ${designTokens.spacing.sm};
    display: inline-block;
    margin-top: ${designTokens.spacing.xs};
  }
`;

const TimeIcon = styled.span`
  margin-right: ${designTokens.spacing.xs};
  font-size: 14px;

  @media (max-width: ${designTokens.breakpoints.sm}) {
    font-size: 16px; /* Increase icon size */
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: ${colors.primaryGradient};
  border-radius: 0 ${designTokens.borderRadius.sm}
    ${designTokens.borderRadius.sm} 0;

  @media (max-width: ${designTokens.breakpoints.sm}) {
    width: 6px; /* Make indicator more visible */
  }
`;

// Modern form elements
const FormGroup = styled.div`
  margin-bottom: ${designTokens.spacing.lg};

  @media (max-width: ${designTokens.breakpoints.sm}) {
    margin-bottom: ${designTokens.spacing
      .xl}; /* Increase spacing between form groups */
  }
`;

const Label = styled.label`
  display: block;
  color: ${colors.textSecondary};
  font-size: 14px;
  font-weight: ${fontWeights.medium};
  margin-bottom: ${designTokens.spacing.sm};
  padding-left: ${designTokens.spacing.xs};

  @media (max-width: ${designTokens.breakpoints.sm}) {
    font-size: 16px; /* Increase label size */
    margin-bottom: ${designTokens.spacing.md}; /* Add more space below label */
  }
`;

const Input = styled.input`
  width: 100%;
  padding: ${designTokens.spacing.md} ${designTokens.spacing.lg};
  border: 1px solid ${colors.borderLight};
  border-radius: ${designTokens.borderRadius.md};
  font-size: 16px;
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

  @media (max-width: ${designTokens.breakpoints.sm}) {
    font-size: 18px; /* Increase input text size */
    padding: ${designTokens.spacing
      .lg}; /* Increase padding for better touch target */
    height: 56px; /* Set explicit height for better touch target */
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 140px;
  padding: ${designTokens.spacing.md} ${designTokens.spacing.lg};
  border: 1px solid ${colors.borderLight};
  border-radius: ${designTokens.borderRadius.md};
  font-size: 16px;
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

  @media (max-width: ${designTokens.breakpoints.sm}) {
    font-size: 18px; /* Increase textarea text size */
    padding: ${designTokens.spacing
      .lg}; /* Increase padding for better touch target */
    height: 160px; /* Increase height for better usability */
  }
`;

// Modern button
const Button = styled.button`
  background: ${colors.primaryGradient};
  color: white;
  border: none;
  border-radius: ${designTokens.borderRadius.md};
  padding: ${designTokens.spacing.md} ${designTokens.spacing.lg};
  font-size: 16px;
  font-weight: ${fontWeights.semibold};
  cursor: pointer;
  width: 100%;
  transition: all ${designTokens.animation.medium};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  box-shadow: ${designTokens.shadows.md};
  position: relative;
  overflow: hidden;

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

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${designTokens.shadows.lg};

    &::before {
      opacity: 1;
    }
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

  @media (max-width: ${designTokens.breakpoints.sm}) {
    font-size: 18px; /* Increase button text size */
    padding: ${designTokens.spacing
      .lg}; /* Increase padding for better touch target */
    height: 56px; /* Set explicit height for better touch target */
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
  margin: ${designTokens.spacing.xl};
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
`;

const SuccessMessage = styled.div`
  position: fixed;
  bottom: ${designTokens.spacing.xl};
  left: 50%;
  transform: translateX(-50%);
  background: ${colors.successGradient};
  color: white;
  padding: ${designTokens.spacing.md} ${designTokens.spacing.xl};
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
`;

// Add these new styled components
const EventInfoCard = styled.div`
  background: ${colors.glassCard};
  backdrop-filter: blur(10px);
  border-radius: ${designTokens.borderRadius.lg};
  padding: ${designTokens.spacing.lg};
  margin-bottom: ${designTokens.spacing.xl};
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: ${designTokens.shadows.lg};
`;

const EventInfoRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${designTokens.spacing.md};
  gap: ${designTokens.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const EventInfoIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${designTokens.borderRadius.md};
  background: ${colors.primaryGradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
`;

const EventInfoContent = styled.div`
  flex: 1;
`;

const EventInfoLabel = styled.div`
  font-size: 13px;
  color: ${colors.textSecondary};
  margin-bottom: 2px;
`;

const EventInfoValue = styled.div`
  font-size: 16px;
  color: ${colors.textPrimary};
  font-weight: ${fontWeights.medium};
`;

const SectionDivider = styled.div`
  height: 8px;
  margin: ${designTokens.spacing.xl} 0;
  background: ${colors.backgroundTertiary};
  border-radius: ${designTokens.borderRadius.full};
  width: 100%;
  opacity: 0.6;
`;

const EmptyStateMessage = styled.div`
  text-align: center;
  padding: ${designTokens.spacing.xl};
  color: ${colors.textSecondary};
  font-size: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${designTokens.spacing.md};

  &::before {
    content: "📅";
    font-size: 32px;
    margin-bottom: ${designTokens.spacing.sm};
  }
`;

// Sponsor deals section - only keeping the components we use
const BannersContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;

  @media (max-width: ${designTokens.breakpoints.md}) {
    grid-template-columns: 1fr;
  }

  @media (max-width: ${designTokens.breakpoints.sm}) {
    gap: 16px; /* Reduce gap on mobile */
  }
`;

const Banner = styled.div<{ backgroundImage: string }>`
  position: relative;
  height: 180px;
  border-radius: 10px;
  overflow: hidden;
  background-image: url(${(props) => props.backgroundImage});
  background-size: cover;
  background-position: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: ${designTokens.breakpoints.sm}) {
    height: 200px; /* Increase height on mobile */
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
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  color: white;

  ${Banner}:hover & {
    opacity: 1;
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
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s ease;
  z-index: 2;

  &:hover {
    background-color: #4f46e5;
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
  padding: 20px;
  backdrop-filter: blur(3px);
  transition: opacity 0.3s ease;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
`;

// Base popup container with shared styles
const PopupContainer = styled.div`
  background-color: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  animation: popupFadeIn 0.3s ease forwards;
  transform-origin: center;

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

  @media (max-width: 768px) {
    width: 95%;
    max-height: 85vh;
  }
`;

// Popup with description
const DescriptionPopup = styled(PopupContainer)`
  min-height: 450px;

  @media (max-width: 768px) {
    min-height: 500px;
  }
`;

// Popup without description
const SimplePopup = styled(PopupContainer)`
  min-height: 400px;

  @media (max-width: 768px) {
    min-height: 450px;
  }
`;

// Popup header with image
const PopupHeader = styled.div<{ hasDescription: boolean }>`
  position: relative;
  width: 100%;
  padding-top: ${(props) => (props.hasDescription ? "56.25%" : "75%")};
  background-size: cover;
  background-position: center;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;

  @media (max-width: 768px) {
    padding-top: ${(props) => (props.hasDescription ? "60%" : "90%")};
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
  padding: ${(props) => (props.hasDescription ? "30px" : "25px")};
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

  @media (max-width: 768px) {
    padding: ${(props) => (props.hasDescription ? "25px 20px" : "30px 20px")};
  }
`;

// Popup title
const PopupTitle = styled.h2<{ hasDescription: boolean }>`
  font-size: ${(props) => (props.hasDescription ? "24px" : "26px")};
  font-weight: ${fontWeights.semibold};
  color: ${colors.textPrimary};
  margin: 0 0 ${(props) => (props.hasDescription ? "20px" : "30px")} 0;

  @media (max-width: 768px) {
    font-size: ${(props) => (props.hasDescription ? "22px" : "24px")};
    margin: 0 0 ${(props) => (props.hasDescription ? "15px" : "25px")} 0;
  }
`;

// Popup description
const PopupDescription = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${colors.textSecondary};
  margin: 0 0 30px 0;

  @media (max-width: 768px) {
    font-size: 15px;
    margin: 0 0 25px 0;
  }
`;

// Popup button
const PopupButton = styled.a<{ hasDescription: boolean }>`
  display: inline-block;
  background-color: ${colors.primary};
  color: white;
  font-weight: ${fontWeights.medium};
  padding: 14px 32px;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  transition: all 0.2s ease;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  ${(props) =>
    props.hasDescription ? "align-self: flex-start;" : "width: 100%;"}

  @media (max-width: 768px) {
    width: 100%;
    padding: 16px 24px;
    font-size: ${(props) => (props.hasDescription ? "16px" : "18px")};
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
  top: 16px;
  right: 16px;
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

  @media (max-width: 768px) {
    top: 12px;
    right: 12px;
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

const VirtualSpace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [feedback, setFeedback] = useState("");
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentTime] = useState(new Date());

  // Add state for the sponsor deal popup
  const [selectedDeal, setSelectedDeal] = useState<SponsorDeal | null>(null);
  const [isDealPopupVisible, setIsDealPopupVisible] = useState(false);

  // Schedule state - initialize with empty array
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  // Add a ref for the popup
  const popupRef = useRef<HTMLDivElement>(null);

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

  const handleSubmitFeedback = async () => {
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
        {/* Event Info Card */}
        <EventInfoCard>
          <EventInfoRow>
            <EventInfoIcon>📅</EventInfoIcon>
            <EventInfoContent>
              <EventInfoLabel>Event Date</EventInfoLabel>
              <EventInfoValue>
                {event.date
                  ? new Date(event.date).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Date not specified"}
              </EventInfoValue>
            </EventInfoContent>
          </EventInfoRow>

          {event.location && (
            <EventInfoRow>
              <EventInfoIcon>📍</EventInfoIcon>
              <EventInfoContent>
                <EventInfoLabel>Location</EventInfoLabel>
                <EventInfoValue>{event.location.address}</EventInfoValue>
              </EventInfoContent>
            </EventInfoRow>
          )}
        </EventInfoCard>

        <SectionHeader>
          <SectionTitle>Schedule</SectionTitle>
        </SectionHeader>

        <Card>
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

                      {/* Move time container inside schedule content on mobile */}
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
                            {getDateBadgeText(
                              item.startDateTime,
                              item.endDateTime
                            )}
                          </DateBadge>
                        )}
                      </ScheduleTimeContainer>
                    </ScheduleContent>
                  </ScheduleItem>
                );
              })
            )}
          </ScheduleContainer>
        </Card>

        {event.emailParams.sponsorDeals?.items &&
          event.emailParams.sponsorDeals.items.length > 0 && (
            <>
              <SectionDivider />

              <SectionHeader>
                <SectionTitle>Sponsor Deals</SectionTitle>
              </SectionHeader>

              <Card>
                <BannersContainer>
                  {event.emailParams.sponsorDeals.items.map((deal) => (
                    <Banner
                      key={deal.id}
                      backgroundImage={deal.imageSrc}
                      onClick={() => handleDealClick(deal)}
                      style={{ cursor: "pointer" }}
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
                    : "Apply Now"}
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
                    : "Apply Now"}
                </PopupButton>
              </PopupContent>
            </SimplePopup>
          ))}
      </PopupBackdrop>

      {submitSuccess && (
        <SuccessMessage>Feedback submitted successfully!</SuccessMessage>
      )}
    </SpaceWrapper>
  );
};

export default VirtualSpace;
