# Flow State - Specification Documentation

## Overview

This directory contains the complete reverse-engineered specification for the Flow State application - a science-based caffeine intake optimization and alertness tracking web application.

## Document Structure

### 1. Requirements Specification (`requirements.md`)
Comprehensive functional and non-functional requirements including:
- User stories with acceptance criteria
- Feature requirements (onboarding, sleep config, intake logging, etc.)
- Performance, usability, and accessibility requirements
- Scientific requirements (caffeine metabolism, alertness models)
- Data requirements and validation rules
- Future enhancement backlog

### 2. Design Specification (`design.md`)
Detailed technical design documentation including:
- System architecture and technology stack
- Data models and type definitions
- Core algorithms (caffeine metabolism, alertness calculation)
- Component architecture and hierarchy
- State management structure
- UI/UX design system
- Internationalization strategy
- Testing strategy
- Performance optimizations
- Correctness properties

### 3. Implementation Tasks (`tasks.md`)
Complete task breakdown of the implemented system:
- 18 phases covering all aspects of development
- 200+ individual tasks (all completed ✅)
- Organized by feature area and dependency order
- Includes setup, core logic, UI components, testing, and deployment

## Application Summary

**Flow State** is a production-ready React + TypeScript SPA that helps users optimize their cognitive performance through evidence-based caffeine management.

**Key Features:**
- Real-time alertness monitoring with 24-hour predictions
- Science-based caffeine metabolism modeling
- Intelligent intake recommendations
- Sleep quality tracking and analysis
- Weekly performance trends
- Multi-language support (Japanese/English)
- Dark mode support
- Mobile-first responsive design

**Technology:**
- React 19.2.0 + TypeScript 5.9.3
- Vite build system
- Recharts for visualization
- i18next for internationalization
- Vitest + React Testing Library
- Deployed on Vercel

## Scientific Foundation

The application implements:
- **Two-Process Model** of sleep regulation (Borbély, 1982)
- **Pharmacokinetic modeling** of caffeine absorption and elimination
- **Dose-response curves** for caffeine effects
- **Circadian rhythm** modeling
- **Sleep debt** calculations

## Status

**Version:** 1.0  
**Status:** Production  
**Deployment:** https://flow-state-vert.vercel.app  
**Last Updated:** 2026-02-09

All specifications have been reverse-engineered from the production codebase and accurately reflect the current implementation.

## Usage

These specifications serve as:
- **Reference documentation** for understanding the system
- **Onboarding material** for new developers
- **Design rationale** for architectural decisions
- **Foundation** for future enhancements
- **Testing baseline** for regression prevention

## Related Files

- Source code: `src/` directory
- Tests: `src/**/*.test.ts(x)` files
- Configuration: `vite.config.ts`, `tsconfig.json`, `eslint.config.js`
- Deployment: `.vercel/` directory
- Backlog: `backlog/` directory
