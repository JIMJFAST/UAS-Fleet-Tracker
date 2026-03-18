import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

// Version
const APP_VERSION = '2.1.9';
console.log('================================');
console.log(`  UAS Fleet Tracker v${APP_VERSION}`);
console.log(`  ${new Date().toLocaleString()}`);
console.log('================================');

// Logging utility for senior engineer debugging
const log = {
  fleet: (action, details) => console.log(`[Fleet] ${action}:`, details),
  data: (action, details) => console.log(`[Data] ${action}:`, details),
  status: (action, details) => console.log(`[Status] ${action}:`, details),
  hours: (action, details) => console.log(`[Hours] ${action}:`, details),
  error: (action, details) => console.error(`[ERROR] ${action}:`, details)
};

// Icons as simple SVG components
const Icons = {
  Plane: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  XSmall: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  ChevronUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>,
  AlertTriangle: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Cpu: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>,
  Radio: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>,
  Weight: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z"/></svg>,
  BarChart: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>,
  List: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>,
};

// Initial sample data — 10 aircraft with realistic history from Jan 2025 to present
const initialAircraft = [
  {
    id: 1001,
    name: 'WOLF-01',
    status: 'active',
    totalHours: 187.5,
    maintenanceInterval: 200,
    lastFlight: '2026-03-15',
    airframeType: 'Hexacopter',
    weight: 42,
    maxWeight: 77,
    flightController: 'Cube Orange',
    fcFirmware: 'ArduCopter 4.5.1',
    companionComputer: 'Raspberry Pi 5',
    companionOS: 'Ubuntu 24.04',
    primaryRadio: 'LTE',
    backupRadio: 'RF 900MHz',
    location: 'Hangar A',
    notes: 'Primary spray platform - approaching maintenance',
    flightLog: [
      { date: '2025-01-12', hours: 4.5 }, { date: '2025-02-08', hours: 6.0 }, { date: '2025-03-15', hours: 8.2 },
      { date: '2025-04-20', hours: 7.5 }, { date: '2025-05-10', hours: 9.0 }, { date: '2025-06-18', hours: 10.5 },
      { date: '2025-07-22', hours: 11.0 }, { date: '2025-08-14', hours: 8.8 }, { date: '2025-09-05', hours: 7.0 },
      { date: '2025-10-12', hours: 12.0 }, { date: '2025-11-20', hours: 6.5 }, { date: '2025-12-08', hours: 5.0 },
      { date: '2026-01-15', hours: 14.0 }, { date: '2026-02-10', hours: 18.5 }, { date: '2026-03-15', hours: 9.0 }
    ],
    statusHistory: [
      { status: 'active', date: '2025-08-20', reason: 'Returned from 100hr service' },
      { status: 'maintenance', date: '2025-08-10', reason: '100hr scheduled maintenance' },
      { status: 'active', date: '2025-01-05', reason: 'Added to fleet' }
    ]
  },
  {
    id: 1002,
    name: 'WOLF-02',
    status: 'active',
    totalHours: 134.0,
    maintenanceInterval: 200,
    lastFlight: '2026-03-12',
    airframeType: 'Hexacopter',
    weight: 42,
    maxWeight: 77,
    flightController: 'Cube Orange',
    fcFirmware: 'ArduCopter 4.5.1',
    companionComputer: 'Raspberry Pi 5',
    companionOS: 'Ubuntu 24.04',
    primaryRadio: 'LTE',
    backupRadio: 'Starlink',
    location: 'Hangar A',
    notes: 'Secondary spray platform',
    flightLog: [
      { date: '2025-03-10', hours: 3.0 }, { date: '2025-04-15', hours: 5.5 }, { date: '2025-05-22', hours: 8.0 },
      { date: '2025-06-30', hours: 10.0 }, { date: '2025-07-18', hours: 12.0 }, { date: '2025-08-25', hours: 9.5 },
      { date: '2025-09-15', hours: 7.0 }, { date: '2025-10-28', hours: 11.0 }, { date: '2025-11-15', hours: 8.0 },
      { date: '2025-12-20', hours: 6.0 }, { date: '2026-01-22', hours: 15.0 }, { date: '2026-02-18', hours: 12.0 },
      { date: '2026-03-12', hours: 10.0 }
    ],
    statusHistory: [
      { status: 'active', date: '2025-03-01', reason: 'Added to fleet' }
    ]
  },
  {
    id: 1003,
    name: 'HAWK-10',
    status: 'maintenance',
    totalHours: 215.3,
    maintenanceInterval: 200,
    lastFlight: '2026-02-28',
    airframeType: 'Quadcopter',
    weight: 28,
    maxWeight: 55,
    flightController: 'Pixhawk 6C',
    fcFirmware: 'ArduCopter 4.4.0',
    companionComputer: 'Raspberry Pi 4',
    companionOS: 'Ubuntu 22.04',
    primaryRadio: 'RF 900MHz',
    backupRadio: 'LTE',
    location: 'Maintenance Bay',
    notes: 'Overdue - motor bearings worn, prop damage from bird strike',
    flightLog: [
      { date: '2025-01-20', hours: 6.0 }, { date: '2025-02-15', hours: 8.0 }, { date: '2025-03-22', hours: 10.5 },
      { date: '2025-04-18', hours: 9.0 }, { date: '2025-05-25', hours: 12.0 }, { date: '2025-06-10', hours: 7.5 },
      { date: '2025-07-15', hours: 11.0 }, { date: '2025-08-20', hours: 8.3 }, { date: '2025-09-28', hours: 9.0 },
      { date: '2025-10-15', hours: 13.0 }, { date: '2025-11-22', hours: 10.0 }, { date: '2025-12-18', hours: 7.0 },
      { date: '2026-01-25', hours: 16.0 }, { date: '2026-02-28', hours: 14.0 }
    ],
    statusHistory: [
      { status: 'maintenance', date: '2026-03-01', reason: 'Bird strike damage - motor bearing replacement' },
      { status: 'active', date: '2025-06-15', reason: 'Returned from annual inspection' },
      { status: 'maintenance', date: '2025-06-01', reason: 'Annual inspection' },
      { status: 'active', date: '2025-01-10', reason: 'Added to fleet' }
    ]
  },
  {
    id: 1004,
    name: 'RAVEN-05',
    status: 'active',
    totalHours: 92.0,
    maintenanceInterval: 200,
    lastFlight: '2026-03-10',
    airframeType: 'Quadcopter',
    weight: 15,
    maxWeight: 25,
    flightController: 'DJI N3',
    fcFirmware: 'v2.0.1',
    companionComputer: 'None',
    companionOS: 'N/A',
    primaryRadio: 'LTE',
    backupRadio: 'None',
    location: 'Field Site 2',
    notes: 'Survey and inspection',
    flightLog: [
      { date: '2025-04-10', hours: 3.0 }, { date: '2025-05-15', hours: 4.5 }, { date: '2025-06-20', hours: 6.0 },
      { date: '2025-07-25', hours: 5.0 }, { date: '2025-08-30', hours: 7.5 }, { date: '2025-09-18', hours: 4.0 },
      { date: '2025-10-22', hours: 6.5 }, { date: '2025-11-10', hours: 5.0 }, { date: '2025-12-15', hours: 3.5 },
      { date: '2026-01-20', hours: 8.0 }, { date: '2026-02-15', hours: 10.0 }, { date: '2026-03-10', hours: 7.0 }
    ],
    statusHistory: [
      { status: 'active', date: '2025-04-01', reason: 'Added to fleet' }
    ]
  },
  {
    id: 1005,
    name: 'FALCON-12',
    status: 'grounded',
    totalHours: 156.8,
    maintenanceInterval: 150,
    lastFlight: '2026-01-18',
    airframeType: 'Fixed Wing',
    weight: 18,
    maxWeight: 35,
    flightController: 'Pixhawk 4',
    fcFirmware: 'ArduPlane 4.3.0',
    companionComputer: 'Jetson Nano',
    companionOS: 'JetPack 5.1',
    primaryRadio: 'RF 2.4GHz',
    backupRadio: 'RF 900MHz',
    location: 'Storage',
    notes: 'ESC failure during flight - awaiting replacement board',
    flightLog: [
      { date: '2025-02-05', hours: 5.0 }, { date: '2025-03-12', hours: 8.0 }, { date: '2025-04-20', hours: 10.0 },
      { date: '2025-05-18', hours: 12.0 }, { date: '2025-06-25', hours: 9.0 }, { date: '2025-07-30', hours: 11.0 },
      { date: '2025-08-22', hours: 8.5 }, { date: '2025-09-15', hours: 7.0 }, { date: '2025-10-10', hours: 10.3 },
      { date: '2025-11-28', hours: 6.0 }, { date: '2025-12-20', hours: 4.0 }, { date: '2026-01-18', hours: 8.0 }
    ],
    statusHistory: [
      { status: 'grounded', date: '2026-01-18', reason: 'ESC failure in flight - emergency landing' },
      { status: 'active', date: '2025-10-05', reason: 'Returned from 100hr service' },
      { status: 'maintenance', date: '2025-09-20', reason: '100hr scheduled maintenance' },
      { status: 'active', date: '2025-02-01', reason: 'Added to fleet' }
    ]
  },
  {
    id: 1006,
    name: 'OSPREY-08',
    status: 'active',
    totalHours: 78.5,
    maintenanceInterval: 200,
    lastFlight: '2026-03-14',
    airframeType: 'VTOL',
    weight: 52,
    maxWeight: 88,
    flightController: 'Cube Orange',
    fcFirmware: 'ArduPlane 4.4.0',
    companionComputer: 'Jetson Xavier',
    companionOS: 'JetPack 5.0',
    primaryRadio: 'Starlink',
    backupRadio: 'LTE',
    location: 'Hangar B',
    notes: 'Long-range delivery platform',
    flightLog: [
      { date: '2025-06-15', hours: 3.0 }, { date: '2025-07-20', hours: 5.5 }, { date: '2025-08-10', hours: 4.0 },
      { date: '2025-09-25', hours: 6.0 }, { date: '2025-10-30', hours: 8.0 }, { date: '2025-11-18', hours: 5.5 },
      { date: '2025-12-12', hours: 4.0 }, { date: '2026-01-28', hours: 9.0 }, { date: '2026-02-20', hours: 12.0 },
      { date: '2026-03-14', hours: 8.5 }
    ],
    statusHistory: [
      { status: 'active', date: '2025-06-10', reason: 'Added to fleet' }
    ]
  },
  {
    id: 1007,
    name: 'EAGLE-15',
    status: 'active',
    totalHours: 45.0,
    maintenanceInterval: 200,
    lastFlight: '2026-03-08',
    airframeType: 'Quadcopter',
    weight: 12,
    maxWeight: 22,
    flightController: 'Pixhawk 6C',
    fcFirmware: 'ArduCopter 4.5.1',
    companionComputer: 'None',
    companionOS: 'N/A',
    primaryRadio: 'LTE',
    backupRadio: 'None',
    location: 'Field Site 1',
    notes: 'Light inspection drone - newest addition',
    flightLog: [
      { date: '2025-10-15', hours: 3.0 }, { date: '2025-11-10', hours: 4.5 }, { date: '2025-12-05', hours: 5.0 },
      { date: '2026-01-12', hours: 6.0 }, { date: '2026-02-08', hours: 8.5 }, { date: '2026-03-08', hours: 6.0 }
    ],
    statusHistory: [
      { status: 'active', date: '2025-10-01', reason: 'Added to fleet' }
    ]
  },
  {
    id: 1008,
    name: 'VIPER-03',
    status: 'active',
    totalHours: 168.0,
    maintenanceInterval: 200,
    lastFlight: '2026-03-16',
    airframeType: 'Octocopter',
    weight: 65,
    maxWeight: 110,
    flightController: 'Cube Orange',
    fcFirmware: 'ArduCopter 4.5.1',
    companionComputer: 'Jetson Xavier',
    companionOS: 'JetPack 5.0',
    primaryRadio: 'Starlink',
    backupRadio: 'RF 900MHz',
    location: 'Hangar A',
    notes: 'Heavy lift - approaching maintenance soon',
    flightLog: [
      { date: '2025-01-08', hours: 5.0 }, { date: '2025-02-12', hours: 7.0 }, { date: '2025-03-18', hours: 9.5 },
      { date: '2025-04-22', hours: 8.0 }, { date: '2025-05-15', hours: 10.0 }, { date: '2025-06-20', hours: 12.0 },
      { date: '2025-07-28', hours: 11.0 }, { date: '2025-08-18', hours: 9.0 }, { date: '2025-09-22', hours: 8.5 },
      { date: '2025-10-15', hours: 10.0 }, { date: '2025-11-20', hours: 7.0 }, { date: '2025-12-10', hours: 6.0 },
      { date: '2026-01-18', hours: 15.0 }, { date: '2026-02-22', hours: 16.0 }, { date: '2026-03-16', hours: 12.0 }
    ],
    statusHistory: [
      { status: 'active', date: '2025-01-05', reason: 'Added to fleet' }
    ]
  },
  {
    id: 1009,
    name: 'SHADOW-07',
    status: 'maintenance',
    totalHours: 110.0,
    maintenanceInterval: 100,
    lastFlight: '2026-02-10',
    airframeType: 'Quadcopter',
    weight: 20,
    maxWeight: 35,
    flightController: 'Pixhawk 6C',
    fcFirmware: 'ArduCopter 4.4.0',
    companionComputer: 'Raspberry Pi 4',
    companionOS: 'Ubuntu 22.04',
    primaryRadio: 'RF 900MHz',
    backupRadio: 'LTE',
    location: 'Maintenance Bay',
    notes: 'Overdue maintenance - 10hrs past interval',
    flightLog: [
      { date: '2025-05-10', hours: 4.0 }, { date: '2025-06-15', hours: 6.0 }, { date: '2025-07-20', hours: 8.0 },
      { date: '2025-08-25', hours: 7.0 }, { date: '2025-09-18', hours: 9.0 }, { date: '2025-10-22', hours: 10.0 },
      { date: '2025-11-15', hours: 8.0 }, { date: '2025-12-10', hours: 6.0 }, { date: '2026-01-15', hours: 12.0 },
      { date: '2026-02-10', hours: 10.0 }
    ],
    statusHistory: [
      { status: 'maintenance', date: '2026-02-15', reason: 'Overdue - full teardown inspection' },
      { status: 'active', date: '2025-09-01', reason: 'Returned from 50hr check' },
      { status: 'maintenance', date: '2025-08-28', reason: '50hr scheduled check' },
      { status: 'active', date: '2025-05-01', reason: 'Added to fleet' }
    ]
  },
  {
    id: 1010,
    name: 'TITAN-20',
    status: 'active',
    totalHours: 22.0,
    maintenanceInterval: 200,
    lastFlight: '2026-03-10',
    airframeType: 'Hexacopter',
    weight: 38,
    maxWeight: 66,
    flightController: 'Pixhawk 6C',
    fcFirmware: 'ArduCopter 4.5.1',
    companionComputer: 'Raspberry Pi 5',
    companionOS: 'Ubuntu 24.04',
    primaryRadio: 'LTE',
    backupRadio: 'Starlink',
    location: 'Hangar B',
    notes: 'Newest platform - low hours, breaking in',
    flightLog: [
      { date: '2026-01-20', hours: 3.0 }, { date: '2026-02-05', hours: 5.0 }, { date: '2026-02-25', hours: 7.0 },
      { date: '2026-03-10', hours: 7.0 }
    ],
    statusHistory: [
      { status: 'active', date: '2026-01-15', reason: 'Added to fleet' }
    ]
  }
];

// Helper: Convert lbs to kg
const lbsToKg = (lbs) => (lbs * 0.453592).toFixed(1);

// Helper: Calculate days between two dates
const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
};

// Helper: Calculate days in each status for an aircraft
// Optional rangeFrom/rangeTo (YYYY-MM-DD) to limit the window
const calculateStatusDays = (aircraft, rangeFrom, rangeTo) => {
  const history = aircraft.statusHistory || [{ status: aircraft.status, date: aircraft.lastFlight || '2024-01-01', reason: '' }];
  const windowEnd = rangeTo || new Date().toLocaleDateString('en-CA');
  const windowStart = rangeFrom || null; // null = all time

  const days = { active: 0, maintenance: 0, grounded: 0 };

  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    let segStart = entry.date;
    let segEnd = i === 0 ? windowEnd : history[i - 1].date;

    // Clip segment to the window
    if (windowStart && segEnd <= windowStart) continue; // entirely before window
    if (segStart >= windowEnd) continue; // entirely after window
    if (windowStart && segStart < windowStart) segStart = windowStart;
    if (segEnd > windowEnd) segEnd = windowEnd;

    const daysInStatus = Math.max(0, daysBetween(segStart, segEnd));
    days[entry.status] = (days[entry.status] || 0) + daysInStatus;
  }

  return days;
};

// Helper: Calculate availability percentage
const calculateAvailability = (aircraft, rangeFrom, rangeTo) => {
  const days = calculateStatusDays(aircraft, rangeFrom, rangeTo);
  const totalDays = days.active + days.maintenance + days.grounded;
  if (totalDays === 0) return 100;
  return Math.round((days.active / totalDays) * 100);
};

// Helper: Get days since last status change
const daysSinceStatusChange = (aircraft) => {
  const history = aircraft.statusHistory || [];
  if (history.length === 0) return 0;
  const today = new Date().toLocaleDateString('en-CA');
  return daysBetween(history[0].date, today);
};

// Helper: Get date aircraft was added to fleet (earliest known date across all data)
const getAddedDate = (aircraft) => {
  const dates = [];
  const history = aircraft.statusHistory || [];
  if (history.length > 0) dates.push(history[history.length - 1].date);
  if (aircraft.lastFlight) dates.push(aircraft.lastFlight);
  if (aircraft.flightLog) {
    aircraft.flightLog.forEach(entry => { if (entry.date) dates.push(entry.date); });
  }
  if (dates.length === 0) return '2024-01-01';
  return dates.sort()[0]; // earliest date
};

// Helper: Filter aircraft that existed during a period
const aircraftInPeriod = (allAircraft, rangeTo) => {
  return allAircraft.filter(a => getAddedDate(a) <= rangeTo);
};

// Helper: Get flight hours within a date range from flight log
const getHoursInRange = (aircraft, rangeFrom, rangeTo) => {
  const logs = aircraft.flightLog || [];
  if (logs.length === 0) return null; // null = no log data, show totalHours as fallback
  return logs
    .filter(entry => entry.date >= rangeFrom && entry.date <= rangeTo)
    .reduce((sum, entry) => sum + entry.hours, 0);
};

const radioOptions = ['LTE', 'RF 900MHz', 'RF 2.4GHz', 'Starlink', 'Mesh', 'None'];
const fcOptions = ['Pixhawk 6C', 'Pixhawk 4', 'Cube Orange', 'Cube Black', 'DJI N3', 'Custom'];
const companionOptions = ['None', 'Raspberry Pi 4', 'Raspberry Pi 5', 'Jetson Nano', 'Jetson Xavier', 'Intel NUC', 'Custom'];
const airframeTypes = ['Quadcopter', 'Hexacopter', 'Octocopter', 'Fixed Wing', 'VTOL', 'Custom'];

// ============================================
// STORAGE HELPER - Works in both Electron and Browser
// ============================================
const isElectron = () => {
  return window.electronAPI && window.electronAPI.isElectron;
};

const Storage = {
  async load() {
    if (isElectron()) {
      return await window.electronAPI.loadFleetData();
    } else {
      try {
        const saved = localStorage.getItem('uas_fleet_data');
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        console.error('LocalStorage load error:', e);
        return null;
      }
    }
  },

  async save(data) {
    if (isElectron()) {
      return await window.electronAPI.saveFleetData(data);
    } else {
      try {
        const dataStr = JSON.stringify(data);
        localStorage.setItem('uas_fleet_data', dataStr);
        return { success: true };
      } catch (e) {
        console.error('LocalStorage save error:', e);
        // Handle quota exceeded error
        if (e.name === 'QuotaExceededError' || e.code === 22) {
          return { success: false, error: 'Storage quota exceeded. Export your data and clear old entries.' };
        }
        return { success: false, error: e.message };
      }
    }
  },

  async getDataPath() {
    if (isElectron()) {
      return await window.electronAPI.getDataPath();
    } else {
      return 'Browser LocalStorage';
    }
  },

  async exportFile(data, format) {
    if (isElectron()) {
      return await window.electronAPI.exportFleetData(data, format);
    } else {
      const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `uas_fleet_export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return { success: true };
    }
  },

  async importFile() {
    if (isElectron()) {
      return await window.electronAPI.importFleetData();
    } else {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) {
            resolve({ success: false, canceled: true });
            return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target.result);
              resolve({ success: true, data });
            } catch (err) {
              resolve({ success: false, error: 'Invalid JSON file' });
            }
          };
          reader.readAsText(file);
        };
        input.click();
      });
    }
  }
};

export default function App() {
  const [aircraft, setAircraft] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dataPath, setDataPath] = useState('');
  const [currentView, setCurrentView] = useState('fleet'); // 'fleet' or 'metrics'
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Status change modal state
  const [statusChangeModal, setStatusChangeModal] = useState(null); // { aircraftId, newStatus }
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [pendingEditSave, setPendingEditSave] = useState(null); // Stores edit data when status change needs reason
  const [expandedHistory, setExpandedHistory] = useState({}); // Track which aircraft history panels are expanded
  
  // Quick log state
  const [quickLogAircraft, setQuickLogAircraft] = useState('');
  const [quickLogHours, setQuickLogHours] = useState('');
  const [quickLogDate, setQuickLogDate] = useState(new Date().toLocaleDateString('en-CA'));

  // Form state
  const [formData, setFormData] = useState({});

  // Dismissible alerts state (session-only, resets on app restart)
  const [dismissedAlerts, setDismissedAlerts] = useState({});

  // Reset confirmation modal
  const [resetConfirm, setResetConfirm] = useState(false);

  // Quick log collapsed by default
  const [quickLogOpen, setQuickLogOpen] = useState(false);

  // Metrics date range — default to current year
  const [metricsFrom, setMetricsFrom] = useState(`${new Date().getFullYear()}-01-01`);
  const [metricsTo, setMetricsTo] = useState(new Date().toLocaleDateString('en-CA'));

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      const saved = await Storage.load();
      // FIX: Check if file exists (not null), not if has items
      // This allows empty fleet [] to be preserved
      if (saved !== null) {
        setAircraft(saved);  // Load whatever was saved (even empty [])
        log.data('Loaded', `${saved.length} aircraft from storage`);
      } else {
        setAircraft(initialAircraft);  // Only load samples on first run
        await Storage.save(initialAircraft);
        log.data('Initialized', `${initialAircraft.length} sample aircraft (first run)`);
      }
      const path = await Storage.getDataPath();
      setDataPath(path);
      setIsLoaded(true);
    };
    loadData();
  }, []);

  // Save data whenever aircraft changes
  useEffect(() => {
    const saveData = async () => {
      if (isLoaded && aircraft.length >= 0) {
        const result = await Storage.save(aircraft);
        if (result && !result.success && result.error) {
          log.error('Save failed', result.error);
          showNotification(result.error, 'warning');
        } else if (result && result.success) {
          log.data('Saved', `${aircraft.length} aircraft to storage`);
        }
      }
    };
    saveData();
  }, [aircraft, isLoaded]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Calculate stats
  const stats = {
    total: aircraft.length,
    active: aircraft.filter(a => a.status === 'active').length,
    maintenance: aircraft.filter(a => a.status === 'maintenance').length,
    grounded: aircraft.filter(a => a.status === 'grounded').length
  };

  // Aircraft approaching maintenance (80% to 99% of interval - not yet due)
  const needsAttention = aircraft.filter(a => 
    a.totalHours >= a.maintenanceInterval * 0.8 && 
    a.totalHours < a.maintenanceInterval && 
    a.status === 'active'
  );

  // Aircraft that are DUE or OVERDUE
  const dueOrOverdue = aircraft.filter(a => 
    a.totalHours >= a.maintenanceInterval && a.status === 'active'
  );

  // Filter and search
  // When searching, show ALL matching aircraft regardless of filter tab
  const filteredAircraft = aircraft.filter(a => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      a.name.toLowerCase().includes(term) ||
      a.airframeType.toLowerCase().includes(term) ||
      a.flightController.toLowerCase().includes(term) ||
      (a.companionComputer && a.companionComputer.toLowerCase().includes(term)) ||
      a.primaryRadio.toLowerCase().includes(term) ||
      (a.backupRadio && a.backupRadio.toLowerCase().includes(term)) ||
      (a.location && a.location.toLowerCase().includes(term)) ||
      (a.notes && a.notes.toLowerCase().includes(term));

    // If searching, skip the filter tab — show all matches
    if (term) return matchesSearch;

    let matchesFilter = filter === 'all';
    if (filter === 'active') matchesFilter = a.status === 'active';
    if (filter === 'maintenance') matchesFilter = a.status === 'maintenance' || (a.status === 'active' && a.totalHours >= a.maintenanceInterval);
    if (filter === 'grounded') matchesFilter = a.status === 'grounded';
    return matchesFilter;
  });

  // Dropdown search results — always searches ALL aircraft regardless of tab
  const searchResults = searchTerm ? aircraft.filter(a => {
    const term = searchTerm.toLowerCase();
    return a.name.toLowerCase().includes(term) ||
      a.airframeType.toLowerCase().includes(term) ||
      a.flightController.toLowerCase().includes(term) ||
      (a.companionComputer && a.companionComputer.toLowerCase().includes(term)) ||
      a.primaryRadio.toLowerCase().includes(term) ||
      (a.backupRadio && a.backupRadio.toLowerCase().includes(term)) ||
      (a.location && a.location.toLowerCase().includes(term)) ||
      (a.notes && a.notes.toLowerCase().includes(term));
  }) : [];

  // Get status color
  const getStatusColor = (a) => {
    if (a.status === 'grounded') return 'bg-gray-500';
    if (a.status === 'maintenance' || a.totalHours >= a.maintenanceInterval) return 'bg-red-500';
    if (a.totalHours >= a.maintenanceInterval * 0.8) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get status badge (pill style)
  const getStatusBadge = (a) => {
    if (a.status === 'grounded') {
      return { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'DOWN' };
    }
    if (a.status === 'maintenance' || a.totalHours >= a.maintenanceInterval) {
      return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'MAINT' };
    }
    if (a.totalHours >= a.maintenanceInterval * 0.8) {
      return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'WARN' };
    }
    return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'OK' };
  };

  // Get hours remaining
  const getHoursRemaining = (a) => {
    return a.maintenanceInterval - a.totalHours;
  };

  // Quick log flight
  const handleQuickLog = () => {
    if (!quickLogAircraft || !quickLogHours || parseFloat(quickLogHours) <= 0) {
      showNotification('Select aircraft and enter valid hours', 'warning');
      return;
    }
    
    const hours = parseFloat(quickLogHours);
    const ac = aircraft.find(a => a.id === parseInt(quickLogAircraft));
    if (!ac) {
      showNotification('Aircraft not found — it may have been removed', 'warning');
      setQuickLogAircraft('');
      return;
    }

    const newTotal = Math.round((ac.totalHours + hours) * 10) / 10;
    setAircraft(prev => prev.map(a => {
      if (a.id === parseInt(quickLogAircraft)) {
        const flightLog = a.flightLog || [];
        return {
          ...a,
          totalHours: newTotal,
          lastFlight: quickLogDate,
          flightLog: [...flightLog, { date: quickLogDate, hours: hours }]
        };
      }
      return a;
    }));

    log.hours('Quick Log', `${ac.name}: +${hours} hrs (Total: ${newTotal} hrs, Date: ${quickLogDate})`);
    showNotification(`Logged ${hours} hours to ${ac.name}`, 'success');
    setQuickLogAircraft('');
    setQuickLogHours('');
    setQuickLogDate(new Date().toLocaleDateString('en-CA'));
  };

  // Open add modal
  const openAddModal = () => {
    setFormData({
      name: '',
      status: 'active',
      totalHours: '',
      maintenanceInterval: 200,
      lastFlight: new Date().toLocaleDateString('en-CA'),
      airframeType: 'Quadcopter',
      weight: '',
      maxWeight: '',
      flightController: 'Pixhawk 6C',
      fcFirmware: '',
      companionComputer: 'None',
      companionOS: '',
      primaryRadio: 'LTE',
      backupRadio: 'None',
      location: '',
      notes: ''
    });
    setEditingId(null);
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (ac) => {
    setFormData({ ...ac });
    setEditingId(ac.id);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData({});
  };

  // Save aircraft
  const handleSave = () => {
    const trimmedName = (formData.name || '').trim();
    
    if (!trimmedName) {
      showNotification('Aircraft name is required', 'warning');
      return;
    }

    // Check for duplicate names (excluding current aircraft if editing)
    const duplicate = aircraft.find(a => 
      a.name.toLowerCase() === trimmedName.toLowerCase() && 
      a.id !== editingId
    );
    if (duplicate) {
      showNotification('Aircraft name already exists', 'warning');
      return;
    }

    // Parse numeric values
    const weight = formData.weight === '' ? 0 : parseFloat(formData.weight) || 0;
    const maxWeight = formData.maxWeight === '' ? 55 : parseFloat(formData.maxWeight) || 55;
    
    // Validate weight <= maxWeight
    if (weight > maxWeight) {
      showNotification('Weight cannot exceed max takeoff weight', 'warning');
      return;
    }

    // Prepare data with proper number conversions (weights in lbs)
    const preparedData = {
      ...formData,
      name: trimmedName,
      totalHours: formData.totalHours === '' ? 0 : parseFloat(formData.totalHours) || 0,
      weight: weight,
      maxWeight: maxWeight,
      maintenanceInterval: formData.maintenanceInterval === '' ? 200 : parseFloat(formData.maintenanceInterval) || 200
    };

    const today = new Date().toLocaleDateString('en-CA');

    if (editingId) {
      // Update existing - check if status changed
      const existingAircraft = aircraft.find(a => a.id === editingId);
      
      if (existingAircraft && existingAircraft.status !== preparedData.status) {
        // Status changed - need to prompt for reason
        setPendingEditSave({
          preparedData,
          editingId,
          existingHistory: existingAircraft.statusHistory || [],
          newStatus: preparedData.status
        });
        setStatusChangeModal({ aircraftId: editingId, newStatus: preparedData.status });
        setStatusChangeReason('');
        setModalOpen(false); // FIX: Hide edit modal before showing status reason modal
        return; // Don't save yet - wait for reason
      }
      
      // No status change - save directly
      setAircraft(prev => prev.map(a =>
        a.id === editingId ? { ...preparedData, id: editingId, statusHistory: existingAircraft?.statusHistory || [] } : a
      ));
      log.fleet('Updated', `${trimmedName} (ID: ${editingId})`);
      showNotification(`${trimmedName} updated`, 'success');
    } else {
      // Add new - initialize statusHistory
      const newAircraft = {
        ...preparedData,
        id: Date.now(),
        statusHistory: [
          { status: preparedData.status, date: today, reason: 'Added to fleet' }
        ]
      };
      setAircraft(prev => [...prev, newAircraft]);
      log.fleet('Added', `${trimmedName} (ID: ${newAircraft.id}, Status: ${preparedData.status})`);
      showNotification(`${trimmedName} added to fleet`, 'success');
    }
    closeModal();
  };

  // Delete aircraft
  const handleDelete = (id) => {
    const ac = aircraft.find(a => a.id === id);
    setAircraft(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
    setExpandedId(null);
    log.fleet('Deleted', `${ac?.name} (ID: ${id})`);
    showNotification(`${ac?.name} removed from fleet`, 'success');
  };

  // Open status change modal
  const openStatusChangeModal = (aircraftId, newStatus) => {
    setStatusChangeModal({ aircraftId, newStatus });
    setStatusChangeReason('');
  };

  // Handle status change with reason
  const handleStatusChange = () => {
    if (!statusChangeModal) return;
    
    const { aircraftId, newStatus } = statusChangeModal;
    const today = new Date().toLocaleDateString('en-CA');
    
    // Check if this is from an edit modal save (pendingEditSave exists)
    if (pendingEditSave && pendingEditSave.editingId === aircraftId) {
      // Complete the pending edit with the status change reason
      const { preparedData, editingId, existingHistory } = pendingEditSave;
      
      const newHistoryEntry = {
        status: newStatus,
        date: today,
        reason: statusChangeReason || `Changed to ${newStatus}`
      };
      
      setAircraft(prev => prev.map(a => 
        a.id === editingId ? { 
          ...preparedData, 
          id: editingId, 
          statusHistory: [newHistoryEntry, ...existingHistory] 
        } : a
      ));
      
      log.status('Changed (via edit)', `${preparedData.name}: → ${newStatus} (${statusChangeReason || 'No reason'})`);
      showNotification(`${preparedData.name} updated`, 'success');
      setPendingEditSave(null);
      closeModal(); // Close the edit modal
    } else {
      // Regular quick status change (not from edit modal)
      setAircraft(prev => prev.map(a => {
        if (a.id === aircraftId) {
          const newHistoryEntry = {
            status: newStatus,
            date: today,
            reason: statusChangeReason || `Changed to ${newStatus}`
          };
          
          const currentHistory = a.statusHistory || [];
          
          return {
            ...a,
            status: newStatus,
            statusHistory: [newHistoryEntry, ...currentHistory]
          };
        }
        return a;
      }));
      
      const acName = aircraft.find(a => a.id === aircraftId)?.name;
      log.status('Changed (quick)', `${acName}: → ${newStatus} (${statusChangeReason || 'No reason'})`);
      showNotification(`${acName} status changed to ${newStatus}`, 'success');
    }

    setStatusChangeModal(null);
    setStatusChangeReason('');
  };

  // Toggle row expand
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Export PDF Fleet Report
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    const m = 14; // margin
    const rw = pw - m * 2; // row width
    let y = 0;

    const checkPage = (needed) => { if (y + needed > 280) { doc.addPage(); y = 14; } };

    // Colors
    const black = [30, 30, 30];
    const dark = [55, 65, 75];
    const mid = [120, 130, 140];
    const light = [180, 185, 192];
    const white = [255, 255, 255];
    const green = [22, 163, 74];
    const red = [200, 40, 40];
    const amber = [180, 130, 0];
    const gray = [120, 120, 120];
    const headerBg = [25, 35, 50];
    const rowAlt = [245, 247, 250];
    const rowWhite = [255, 255, 255];
    const tableBorder = [210, 215, 220];

    // === HEADER BANNER ===
    doc.setFillColor(...headerBg);
    doc.rect(0, 0, pw, 36, 'F');
    // Title
    doc.setTextColor(...white);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('UAS FLEET REPORT', m, 16);
    // Subtitle
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 190, 210);
    doc.text(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), m, 24);
    doc.text(`${new Date().toLocaleTimeString()}`, m, 30);
    y = 44;

    // === FLEET SUMMARY CARDS ===
    const cardW = (rw - 9) / 4;
    const cards = [
      { label: 'Total Fleet', value: stats.total, color: headerBg },
      { label: 'Active', value: stats.active, color: green },
      { label: 'Maintenance', value: stats.maintenance, color: red },
      { label: 'Grounded', value: stats.grounded, color: gray }
    ];
    cards.forEach((card, i) => {
      const cx = m + i * (cardW + 3);
      // Card bg
      doc.setFillColor(248, 249, 252);
      doc.roundedRect(cx, y, cardW, 20, 2, 2, 'F');
      // Left accent
      doc.setFillColor(...card.color);
      doc.rect(cx, y + 2, 2.5, 16, 'F');
      // Value
      doc.setTextColor(...black);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(String(card.value), cx + 8, y + 11);
      // Label
      doc.setTextColor(...mid);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(card.label.toUpperCase(), cx + 8, y + 17);
    });
    y += 28;

    // === STATUS BAR with legend ===
    const barH = 5;
    const greenW = stats.total > 0 ? (stats.active / stats.total) * rw : 0;
    const redW = stats.total > 0 ? (stats.maintenance / stats.total) * rw : 0;
    const grayW = Math.max(0, rw - greenW - redW);
    doc.setFillColor(...green); doc.roundedRect(m, y, greenW || 0.1, barH, 1, 1, 'F');
    if (redW > 0) { doc.setFillColor(...red); doc.rect(m + greenW, y, redW, barH, 'F'); }
    if (grayW > 0) { doc.setFillColor(...gray); doc.roundedRect(m + greenW + redW, y, grayW, barH, 1, 1, 'F'); }
    y += barH + 2;
    // Legend
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    const legendItems = [
      { label: `Active (${stats.active})`, color: green },
      { label: `Maintenance (${stats.maintenance})`, color: red },
      { label: `Grounded (${stats.grounded})`, color: gray }
    ];
    let lx = m;
    legendItems.forEach(item => {
      doc.setFillColor(...item.color);
      doc.circle(lx + 1.5, y + 1, 1.5, 'F');
      doc.setTextColor(...dark);
      doc.text(item.label, lx + 5, y + 2);
      lx += 40;
    });
    y += 8;

    // === MAINTENANCE ALERTS ===
    const overdue = aircraft.filter(a => a.totalHours >= a.maintenanceInterval && a.status === 'active');
    const approaching = aircraft.filter(a => a.totalHours >= a.maintenanceInterval * 0.8 && a.totalHours < a.maintenanceInterval && a.status === 'active');

    if (overdue.length > 0 || approaching.length > 0) {
      doc.setFillColor(255, 245, 245);
      const alertH = (overdue.length + approaching.length) * 5 + 10;
      doc.roundedRect(m, y, rw, alertH, 2, 2, 'F');
      doc.setDrawColor(230, 180, 180);
      doc.roundedRect(m, y, rw, alertH, 2, 2, 'S');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...red);
      doc.text('MAINTENANCE ALERTS', m + 4, y + 6);
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      overdue.forEach(a => {
        doc.setTextColor(...red);
        doc.text(`■  OVERDUE: ${a.name} — ${(a.totalHours - a.maintenanceInterval).toFixed(1)} hrs past interval`, m + 6, y);
        y += 5;
      });
      approaching.forEach(a => {
        doc.setTextColor(...amber);
        doc.text(`▲  DUE SOON: ${a.name} — ${(a.maintenanceInterval - a.totalHours).toFixed(1)} hrs remaining`, m + 6, y);
        y += 5;
      });
      y += 4;
    }

    // === AIRCRAFT TABLE ===
    // Section header
    doc.setFillColor(...headerBg);
    doc.roundedRect(m, y, rw, 8, 2, 2, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('FLEET ROSTER', m + 4, y + 5.5);
    y += 12;

    // Table columns
    const cols = [m, m + 30, m + 58, m + 82, m + 100, m + 122, m + 150];
    const colLabels = ['AIRCRAFT', 'TYPE', 'STATUS', 'HOURS', 'TO MAINT', 'RADIO', 'LOCATION'];

    // Table header row
    doc.setFillColor(235, 238, 242);
    doc.rect(m, y - 4, rw, 7, 'F');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...dark);
    colLabels.forEach((label, i) => doc.text(label, cols[i], y));
    // Header bottom line
    doc.setDrawColor(...tableBorder);
    doc.setLineWidth(0.3);
    doc.line(m, y + 2.5, m + rw, y + 2.5);
    y += 6;

    // Table rows
    aircraft.forEach((a, idx) => {
      checkPage(22);

      const rowY = y - 3.5;
      // Alternating rows
      doc.setFillColor(...(idx % 2 === 0 ? rowWhite : rowAlt));
      doc.rect(m, rowY, rw, 6, 'F');

      const hoursLeft = a.maintenanceInterval - a.totalHours;

      // Name — bold black
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...black);
      doc.text(a.name || '-', cols[0], y);

      // Type
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...dark);
      doc.text(a.airframeType || '-', cols[1], y);

      // Status — colored
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      if (a.status === 'active') doc.setTextColor(...green);
      else if (a.status === 'maintenance') doc.setTextColor(...red);
      else doc.setTextColor(...gray);
      doc.text(a.status.toUpperCase(), cols[2], y);

      // Hours
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...black);
      doc.text(a.totalHours.toFixed(1), cols[3], y);

      // To Maint — colored
      doc.setFont('helvetica', 'bold');
      if (hoursLeft < 0) doc.setTextColor(...red);
      else if (hoursLeft <= 20) doc.setTextColor(...amber);
      else { doc.setTextColor(...dark); doc.setFont('helvetica', 'normal'); }
      doc.text(hoursLeft < 0 ? 'OVERDUE' : hoursLeft === 0 ? 'DUE' : hoursLeft.toFixed(1), cols[4], y);

      // Radio
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...dark);
      doc.text(a.primaryRadio || '-', cols[5], y);

      // Location
      doc.text((a.location || '-').substring(0, 14), cols[6], y);

      y += 6;

      // Detail row
      doc.setFontSize(6.5);
      doc.setTextColor(...mid);
      doc.text(`FC: ${a.flightController || '-'}  |  FW: ${a.fcFirmware || '-'}  |  ${a.weight} lbs / ${a.maxWeight} lbs MTOW  |  Last Flight: ${a.lastFlight || '-'}`, cols[0] + 1, y);
      y += 4.5;

      // Notes
      if (a.notes) {
        doc.setTextColor(...light);
        doc.setFontSize(6);
        doc.text(`${a.notes.substring(0, 100)}`, cols[0] + 1, y);
        y += 4;
      }

      // Row separator
      doc.setDrawColor(...tableBorder);
      doc.setLineWidth(0.15);
      doc.line(m, y, m + rw, y);
      y += 2;
    });

    // === FOOTER ===
    y += 4;
    checkPage(12);
    doc.setDrawColor(...tableBorder);
    doc.setLineWidth(0.5);
    doc.line(m, y, m + rw, y);
    y += 6;
    doc.setFontSize(7);
    doc.setTextColor(...mid);
    doc.setFont('helvetica', 'normal');
    doc.text(`UAS Fleet Tracker v${APP_VERSION}`, m, y);
    doc.text(`${aircraft.length} aircraft  |  Generated ${new Date().toLocaleString()}`, m + rw, y, { align: 'right' });

    // Save
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    doc.save(`UAS-Fleet-Report-${timestamp}.pdf`);
    log.data('Exported PDF', `${aircraft.length} aircraft`);
    showNotification('Fleet report exported as PDF', 'success');
  };

  // Export JSON (full backup)
  const handleExportJSON = async () => {
    const result = await Storage.exportFile(JSON.stringify(aircraft, null, 2), 'json');
    if (result.success) {
      log.data('Exported JSON', `${aircraft.length} aircraft (full backup)`);
      showNotification('Fleet backup exported', 'success');
    }
  };

  // FIX: Validate imported aircraft data structure
  // Validate and normalize imported aircraft data (flexible type handling)
  const validateAircraftData = (data) => {
    if (!Array.isArray(data)) return { valid: false, error: 'Data must be an array', data: null };

    const normalized = [];
    for (let i = 0; i < data.length; i++) {
      const a = data[i];
      if (!a || typeof a !== 'object') {
        return { valid: false, error: `Item ${i + 1} is not an object`, data: null };
      }

      // Coerce and validate id (accept number or string)
      const id = Number(a.id);
      if (isNaN(id) || id <= 0) {
        return { valid: false, error: `Item ${i + 1} missing valid id`, data: null };
      }

      // Validate name
      if (!a.name || (typeof a.name !== 'string') || !String(a.name).trim()) {
        return { valid: false, error: `Item ${i + 1} missing name`, data: null };
      }

      // Validate status (default to 'active' if missing)
      const status = a.status || 'active';
      if (!['active', 'maintenance', 'grounded'].includes(status)) {
        return { valid: false, error: `Item ${i + 1} has invalid status`, data: null };
      }

      // Coerce totalHours (accept number or string, default to 0)
      const totalHours = Number(a.totalHours) || 0;
      if (isNaN(totalHours) || totalHours < 0) {
        return { valid: false, error: `Item ${i + 1} has invalid totalHours`, data: null };
      }

      // Coerce maintenanceInterval (accept number or string, default to 200)
      const maintenanceInterval = Number(a.maintenanceInterval) || 200;
      if (isNaN(maintenanceInterval) || maintenanceInterval <= 0) {
        return { valid: false, error: `Item ${i + 1} has invalid maintenanceInterval`, data: null };
      }

      // Build normalized object with all fields
      normalized.push({
        ...a,
        id: id,
        name: String(a.name).trim(),
        status: status,
        totalHours: totalHours,
        maintenanceInterval: maintenanceInterval,
        weight: Number(a.weight) || 0,
        maxWeight: Number(a.maxWeight) || 55,
        statusHistory: Array.isArray(a.statusHistory)
          ? [...a.statusHistory].sort((x, y) => new Date(y.date) - new Date(x.date))
          : []
      });
    }
    return { valid: true, data: normalized };
  };

  // Import JSON
  const handleImportJSON = async () => {
    const result = await Storage.importFile();
    if (result.success && result.data) {
      const validation = validateAircraftData(result.data);
      if (validation.valid && validation.data) {
        setAircraft(validation.data);  // Use normalized data
        log.data('Imported JSON', `${validation.data.length} aircraft`);
        showNotification(`Imported ${validation.data.length} aircraft`, 'success');
      } else {
        log.error('Import failed', validation.error);
        showNotification(`Invalid data: ${validation.error}`, 'warning');
      }
    } else if (result.error) {
      log.error('Import failed', result.error);
      showNotification(result.error, 'warning');
    }
  };

  // Reset to sample data
  const handleResetData = () => {
    setResetConfirm(true);
  };
  const confirmReset = () => {
    setAircraft(initialAircraft);
    setResetConfirm(false);
    showNotification('Data reset to sample aircraft', 'success');
  };

  // Update form field
  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 md:p-8">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 toast-animate ${
          notification.type === 'warning'
            ? 'bg-yellow-900/90 border border-yellow-700 text-yellow-200'
            : 'bg-gray-800 border border-green-700 text-green-200'
        }`}>
          {notification.type === 'warning' ? (
            <Icons.AlertTriangle />
          ) : (
            <Icons.Check />
          )}
          <span className="flex-1">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className={`p-1 rounded hover:bg-black/20 transition ${
              notification.type === 'warning' ? 'text-yellow-300' : 'text-green-300'
            }`}
          >
            <Icons.XSmall />
          </button>
        </div>
      )}

      {/* Loading State */}
      {!isLoaded && (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading fleet data...</div>
        </div>
      )}

      {isLoaded && (
      <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400"><Icons.Plane /></div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">UAS Fleet Tracker</h1>
            <div className="text-xs text-gray-500">{stats.total} aircraft · {stats.active} active</div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Search name, type, radio..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchDropdown(e.target.value.length > 0);
              }}
              onFocus={() => searchTerm && setShowSearchDropdown(true)}
              onBlur={() => setShowSearchDropdown(false)}
              className="w-full sm:w-56 bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-8 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setSearchTerm('');
                  setShowSearchDropdown(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <Icons.XSmall />
              </button>
            )}
            {showSearchDropdown && searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map(a => (
                    <div
                      key={a.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setExpandedId(a.id);
                        setSearchTerm('');
                        setShowSearchDropdown(false);
                        setFilter('all');
                      }}
                      className="px-3 py-2 hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(a)}`}></div>
                      <span className="font-medium">{a.name}</span>
                      <span className="text-gray-500 text-xs">{a.airframeType}</span>
                      <span className={`text-xs ml-auto capitalize ${
                        a.status === 'active' ? 'text-green-500' :
                        a.status === 'maintenance' ? 'text-red-400' : 'text-gray-500'
                      }`}>{a.status}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-3 text-gray-500 text-sm text-center">No aircraft found</div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 btn-primary-gradient px-4 py-2 rounded-lg font-medium transition"
          >
            <Icons.Plus /> Add Aircraft
          </button>
        </div>
      </div>

      {/* Bottom Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-700 pb-0">
        <button
          onClick={() => setCurrentView('fleet')}
          className={`tab-btn flex items-center gap-2 px-4 py-3 font-medium text-gray-400 hover:text-gray-200 ${
            currentView === 'fleet' ? 'active' : ''
          }`}
        >
          <Icons.List /> Fleet
        </button>
        <button
          onClick={() => setCurrentView('metrics')}
          className={`tab-btn flex items-center gap-2 px-4 py-3 font-medium text-gray-400 hover:text-gray-200 ${
            currentView === 'metrics' ? 'active' : ''
          }`}
        >
          <Icons.BarChart /> Metrics
        </button>
      </div>

      {/* ============ FLEET VIEW ============ */}
      {currentView === 'fleet' && (
      <>
      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 border-l-4 border-l-blue-500">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Fleet</div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 border-l-4 border-l-green-500">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Active</div>
          <div className="text-3xl font-bold text-green-400">{stats.active}</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 border-l-4 border-l-red-500">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Maintenance</div>
          <div className="text-3xl font-bold text-red-400">{stats.maintenance}</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 border-l-4 border-l-gray-500">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Grounded</div>
          <div className="text-3xl font-bold text-gray-400">{stats.grounded}</div>
        </div>
      </div>

      {/* Alert Banner - Approaching Maintenance (Dismissible) */}
      {needsAttention.length > 0 && !dismissedAlerts.approaching && (
        <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-3 mb-4 flex items-center gap-3">
          <div className="text-yellow-500"><Icons.AlertTriangle /></div>
          <span className="text-yellow-200 text-sm flex-1">
            <strong>{needsAttention.length} aircraft</strong> approaching maintenance: {needsAttention.map(a => a.name).join(', ')}
          </span>
          <button
            onClick={() => setDismissedAlerts(prev => ({ ...prev, approaching: true }))}
            className="text-yellow-400 hover:text-yellow-200 p-1 hover:bg-yellow-800/50 rounded transition"
            title="Dismiss until restart"
          >
            <Icons.XSmall />
          </button>
        </div>
      )}

      {/* Alert Banner - DUE or OVERDUE (Dismissible) */}
      {dueOrOverdue.length > 0 && !dismissedAlerts.dueOverdue && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 mb-4 flex items-center gap-3">
          <div className="text-red-500"><Icons.AlertTriangle /></div>
          <span className="text-red-200 text-sm flex-1">
            <strong>{dueOrOverdue.length} aircraft</strong> maintenance DUE/OVERDUE: {dueOrOverdue.map(a => {
              const remaining = a.maintenanceInterval - a.totalHours;
              return `${a.name} (${remaining === 0 ? 'DUE' : `OVERDUE ${Math.abs(remaining).toFixed(1)} hrs`})`;
            }).join(', ')}
          </span>
          <button
            onClick={() => setDismissedAlerts(prev => ({ ...prev, dueOverdue: true }))}
            className="text-red-400 hover:text-red-200 p-1 hover:bg-red-800/50 rounded transition"
            title="Dismiss until restart"
          >
            <Icons.XSmall />
          </button>
        </div>
      )}

      {/* In Maintenance Section (Dismissible) */}
      {aircraft.filter(a => a.status === 'maintenance').length > 0 && !dismissedAlerts.inMaintenance && (
        <div className="bg-red-900/30 border border-red-700 rounded-2xl p-4 mb-6 relative shadow-lg">
          <button
            onClick={() => setDismissedAlerts(prev => ({ ...prev, inMaintenance: true }))}
            className="absolute top-3 right-3 text-red-400 hover:text-red-200 p-1 hover:bg-red-800/50 rounded transition"
            title="Dismiss until restart"
          >
            <Icons.XSmall />
          </button>
          <div className="text-xs font-medium text-red-400 uppercase tracking-wider mb-3">In Maintenance</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {aircraft.filter(a => a.status === 'maintenance').map(a => (
              <div key={a.id} className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{a.name}</div>
                  <div className="text-xs text-gray-400">{a.airframeType} • {a.totalHours.toFixed(1)} hrs</div>
                  {a.notes && <div className="text-xs text-red-300 mt-1">{a.notes}</div>}
                </div>
                <button
                  onClick={() => openStatusChangeModal(a.id, 'active')}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs font-medium transition"
                >
                  Return to Service
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Flight Log — collapsible */}
      <div className="bg-gray-800 rounded-xl mb-6 border border-gray-700 overflow-hidden">
        <button
          onClick={() => setQuickLogOpen(!quickLogOpen)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-750 transition"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
            <Icons.Clock /> Quick Flight Log
          </div>
          <span className={`text-gray-500 text-xs transition-transform ${quickLogOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {quickLogOpen && (
          <div className="px-4 pb-4 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-3">
              <select
                value={quickLogAircraft}
                onChange={(e) => setQuickLogAircraft(e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Aircraft</option>
                {aircraft.filter(a => a.status === 'active').map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.totalHours} hrs)</option>
                ))}
              </select>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="Hours"
                value={quickLogHours}
                onChange={(e) => setQuickLogHours(e.target.value)}
                className="w-full sm:w-24 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <input
                type="date"
                value={quickLogDate}
                max={new Date().toLocaleDateString('en-CA')}
                onChange={(e) => setQuickLogDate(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleQuickLog}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
              >
                <Icons.Check /> Log
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & Data Management */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
          {['all', 'active', 'maintenance', 'grounded'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition capitalize ${
                filter === f
                  ? 'bg-gray-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {f === 'all' ? `All (${stats.total})` :
               f === 'active' ? `Active (${stats.active})` :
               f === 'maintenance' ? `Maint (${stats.maintenance})` :
               `Down (${stats.grounded})`}
            </button>
          ))}
        </div>
        <div className="flex-1"></div>
        <div className="flex gap-1">
          <button onClick={handleImportJSON} className="p-2 hover:bg-gray-700 rounded-lg text-gray-500 hover:text-gray-300 transition" title="Import JSON">
            <Icons.Upload />
          </button>
          <button onClick={handleExportJSON} className="p-2 hover:bg-gray-700 rounded-lg text-gray-500 hover:text-gray-300 transition" title="Export JSON backup">
            <Icons.Download />
          </button>
          <button onClick={handleExportPDF} className="p-2 hover:bg-gray-700 rounded-lg text-gray-500 hover:text-gray-300 transition" title="Export PDF report">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </button>
          <button onClick={handleResetData} className="p-2 hover:bg-red-900/50 rounded-lg text-gray-500 hover:text-red-400 transition" title="Reset to sample data">
            <Icons.Trash />
          </button>
        </div>
      </div>

      {/* Aircraft Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden overflow-x-auto">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-700 text-[11px] text-gray-500 font-semibold uppercase tracking-wider min-w-[600px] sticky top-0 bg-gray-800/95 backdrop-blur z-10">
          <div className="col-span-1">STS</div>
          <div className="col-span-2">Aircraft</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Radio</div>
          <div className="col-span-2 text-right">To Maint.</div>
          <div className="col-span-2 text-right">Hours</div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        {filteredAircraft.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-600 text-3xl mb-2">✈</div>
            <div className="text-gray-500 font-medium">No aircraft found</div>
            <div className="text-gray-600 text-sm mt-1">{searchTerm ? 'Try a different search term' : 'Add aircraft to get started'}</div>
          </div>
        ) : (
          filteredAircraft.map((a, index) => {
            const hoursRemaining = getHoursRemaining(a);
            const isExpanded = expandedId === a.id;

            return (
              <div key={a.id} className="border-b border-gray-700 last:border-b-0">
                {/* Main Row */}
                <div
                  className={`grid grid-cols-12 gap-2 px-4 py-3 cursor-pointer hover:bg-gray-750 transition items-center min-w-[600px] table-row-hover ${isExpanded ? 'bg-gray-750' : index % 2 === 1 ? 'bg-gray-800/40' : ''}`}
                  onClick={() => toggleExpand(a.id)}
                >
                  <div className="col-span-1">
                    {(() => {
                      const badge = getStatusBadge(a);
                      return (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="col-span-2 font-medium truncate">{a.name}</div>
                  <div className="col-span-2 text-gray-400 truncate">{a.airframeType || '-'}</div>
                  <div className="col-span-2 text-gray-400 truncate">{a.primaryRadio || '-'}</div>
                  <div className={`col-span-2 text-right font-mono ${
                    hoursRemaining < 0 ? 'text-red-400 font-bold' : 
                    hoursRemaining === 0 ? 'text-red-400 font-bold' :
                    hoursRemaining <= 20 ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {hoursRemaining < 0 ? 'OVERDUE' : hoursRemaining === 0 ? 'DUE' : `${hoursRemaining.toFixed(1)}`}
                  </div>
                  <div className="col-span-2 text-right font-mono">{a.totalHours.toFixed(1)}</div>
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(a); }}
                      className="p-1.5 hover:bg-gray-600 rounded transition"
                      title="Edit"
                    >
                      <Icons.Edit />
                    </button>
                    {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 py-4 bg-gray-850 border-t border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Icons.Cpu /> Flight Controller
                        </div>
                        <div className="text-sm font-medium">{a.flightController}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{a.fcFirmware || 'No firmware info'}</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Icons.Cpu /> Companion
                        </div>
                        <div className="text-sm font-medium">{a.companionComputer}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{a.companionOS || 'N/A'}</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Icons.Radio /> Radio
                        </div>
                        <div className="text-sm font-medium">{a.primaryRadio}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Backup: {a.backupRadio}</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Icons.Weight /> Weight
                        </div>
                        <div className="text-sm font-medium">{a.weight} lbs <span className="text-gray-500">({lbsToKg(a.weight)} kg)</span></div>
                        <div className="text-xs text-gray-500 mt-0.5">MTOW: {a.maxWeight} lbs · Payload: {(a.maxWeight - a.weight).toFixed(1)} lbs</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Last Flight</div>
                        <div className="text-sm font-medium">{a.lastFlight}</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Location</div>
                        <div className="text-sm font-medium">{a.location || '-'}</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Maintenance</div>
                        <div className="text-sm font-medium">
                          {hoursRemaining < 0 ? (
                            <span className="text-red-400">OVERDUE {Math.abs(hoursRemaining).toFixed(1)} hrs</span>
                          ) : hoursRemaining === 0 ? (
                            <span className="text-red-400">DUE NOW</span>
                          ) : (
                            <span>{hoursRemaining.toFixed(1)} hrs remaining</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">Interval: {a.maintenanceInterval} hrs</div>
                      </div>
                    </div>

                    {a.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="text-xs text-gray-500 uppercase mb-1">Notes</div>
                        <div className="text-sm text-gray-300">{a.notes}</div>
                      </div>
                    )}

                    {/* Status Timeline - Collapsible */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setExpandedHistory(prev => ({ ...prev, [a.id]: !prev[a.id] }));
                        }}
                        className="w-full flex items-center justify-between text-left hover:bg-gray-700/30 rounded-lg p-2 -m-2 transition"
                      >
                        <div className="flex items-center gap-2">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className={`text-gray-400 transition-transform ${expandedHistory[a.id] ? 'rotate-90' : ''}`}
                          >
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                          <span className="text-xs text-gray-500 uppercase">Status History</span>
                          <span className="text-xs text-gray-600">({(a.statusHistory || []).length} entries)</span>
                        </div>
                        <div className={`text-sm font-medium ${
                          calculateAvailability(a) >= 80 ? 'text-green-400' :
                          calculateAvailability(a) >= 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {calculateAvailability(a)}% Avail
                        </div>
                      </button>
                      
                      {expandedHistory[a.id] && (
                        <div className="mt-3">
                          {/* Availability Stats */}
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            {(() => {
                              const days = calculateStatusDays(a);
                              const total = days.active + days.maintenance + days.grounded;
                              return (
                                <>
                                  <div className="bg-green-900/20 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-green-400">{days.active}</div>
                                    <div className="text-xs text-gray-400">Days Active</div>
                                  </div>
                                  <div className="bg-red-900/20 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-red-400">{days.maintenance}</div>
                                    <div className="text-xs text-gray-400">Days in Maint</div>
                                  </div>
                                  <div className="bg-gray-700/50 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-gray-400">{days.grounded}</div>
                                    <div className="text-xs text-gray-400">Days Grounded</div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>

                          {/* Availability Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Availability</span>
                              <span>{calculateAvailability(a)}%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  calculateAvailability(a) >= 80 ? 'progress-green' :
                                  calculateAvailability(a) >= 50 ? 'progress-yellow' : 'progress-red'
                                }`}
                                style={{ width: `${calculateAvailability(a)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Timeline */}
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {(a.statusHistory || []).map((entry, idx) => (
                              <div key={idx} className="flex items-start gap-3 text-sm">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                  entry.status === 'active' ? 'bg-green-500' :
                                  entry.status === 'maintenance' ? 'bg-red-500' : 'bg-gray-500'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium capitalize">{entry.status}</span>
                                    <span className="text-gray-500 text-xs">{entry.date}</span>
                                    {idx === 0 && <span className="text-xs bg-blue-600 px-1.5 py-0.5 rounded">Current</span>}
                                  </div>
                                  {entry.reason && (
                                    <div className="text-gray-400 text-xs truncate">{entry.reason}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {(!a.statusHistory || a.statusHistory.length === 0) && (
                              <div className="text-gray-500 text-sm">No status history recorded</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Status Change */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="text-xs text-gray-500 uppercase mb-2">Quick Status Change</div>
                      <div className="flex flex-wrap gap-2">
                        {a.status !== 'active' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openStatusChangeModal(a.id, 'active'); }}
                            className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg text-sm font-medium transition"
                          >
                            Return to Active
                          </button>
                        )}
                        {a.status !== 'maintenance' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openStatusChangeModal(a.id, 'maintenance'); }}
                            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm font-medium transition"
                          >
                            Send to Maintenance
                          </button>
                        )}
                        {a.status !== 'grounded' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openStatusChangeModal(a.id, 'grounded'); }}
                            className="px-3 py-1.5 bg-gray-600/50 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition"
                          >
                            Ground Aircraft
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700 flex flex-wrap gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEditModal(a); }}
                        className="px-4 py-2 btn-primary-gradient rounded-lg text-sm font-medium transition"
                      >
                        Edit Aircraft
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(a.id); }}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      </>
      )}

      {/* ============ METRICS VIEW ============ */}
      {currentView === 'metrics' && (() => {
        // === METRICS COMPUTED VALUES (shared across all sections) ===
        const pa = aircraftInPeriod(aircraft, metricsTo);
        const today = new Date().toLocaleDateString('en-CA');
        const periodDays = daysBetween(metricsFrom, metricsTo);

        // Per-aircraft metrics for the period
        const paMetrics = pa.map(a => ({
          ...a,
          avail: calculateAvailability(a, metricsFrom, metricsTo),
          days: calculateStatusDays(a, metricsFrom, metricsTo),
          hoursRemaining: a.maintenanceInterval - a.totalHours,
          periodHours: getHoursInRange(a, metricsFrom, metricsTo),
          addedDate: getAddedDate(a),
          daysSinceLast: daysSinceStatusChange(a)
        }));

        const avgAvail = paMetrics.length > 0 ? Math.round(paMetrics.reduce((s, a) => s + a.avail, 0) / paMetrics.length) : 0;
        const hasFlightLog = paMetrics.some(a => a.periodHours !== null);
        const totalPeriodHours = paMetrics.reduce((s, a) => s + (a.periodHours !== null ? a.periodHours : a.totalHours), 0);

        return (
      <div className="space-y-5">

        {/* Date Range Filter */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mr-2">Period</div>
          <div className="flex gap-1 flex-wrap">
            {[
              { label: '30 Days', from: new Date(Date.now() - 30*86400000).toLocaleDateString('en-CA') },
              { label: '6 Months', from: new Date(Date.now() - 182*86400000).toLocaleDateString('en-CA') },
              { label: 'This Year', from: `${new Date().getFullYear()}-01-01` },
              { label: 'Last Year', from: `${new Date().getFullYear()-1}-01-01`, to: `${new Date().getFullYear()-1}-12-31` },
              { label: 'All Time', from: '2020-01-01' },
            ].map(p => {
              const isActive = metricsFrom === p.from && metricsTo === (p.to || today);
              return (
                <button key={p.label} onClick={() => { setMetricsFrom(p.from); setMetricsTo(p.to || today); }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
                >{p.label}</button>
              );
            })}
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-2 text-xs">
            <input type="date" value={metricsFrom} onChange={e => setMetricsFrom(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-blue-500" />
            <span className="text-gray-600">to</span>
            <input type="date" value={metricsTo} max={today} onChange={e => setMetricsTo(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-blue-500" />
          </div>
          <div className="text-[10px] text-gray-600">{pa.length} aircraft · {periodDays}d</div>
        </div>

        {/* Row 1: Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 border-l-4 border-l-blue-500">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Aircraft</div>
            <div className="text-2xl font-bold text-white mt-1">{paMetrics.length}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 border-l-4 border-l-green-500">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Avg Availability</div>
            <div className={`text-2xl font-bold mt-1 ${avgAvail >= 80 ? 'text-green-400' : avgAvail >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {paMetrics.length === 0 ? '—' : `${avgAvail}%`}
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">{hasFlightLog ? 'Period' : 'Total'} Hours</div>
            <div className="text-2xl font-bold text-white mt-1">{Math.round(totalPeriodHours)}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Avg Hours</div>
            <div className="text-2xl font-bold text-white mt-1">{paMetrics.length > 0 ? (totalPeriodHours / paMetrics.length).toFixed(1) : '0'}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 border-l-4 border-l-red-500">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Overdue</div>
            <div className="text-2xl font-bold text-red-400 mt-1">{paMetrics.filter(a => a.hoursRemaining < 0 && a.status === 'active').length}</div>
          </div>
        </div>

        {/* Row 2: Availability Breakdown — THE core time-filtered metric */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Availability — {periodDays} Day Period</div>
            <div className="flex gap-3 text-[10px] text-gray-600">
              <span><span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1"></span>Active</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>Maintenance</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-1"></span>Grounded</span>
            </div>
          </div>
          {paMetrics.length === 0 ? (
            <div className="text-center text-gray-600 py-6">No aircraft in selected period</div>
          ) : (
            <div className="space-y-3">
              {[...paMetrics].sort((a, b) => b.avail - a.avail).map(a => {
                const total = Math.max(a.days.active + a.days.maintenance + a.days.grounded, 1);
                return (
                  <div key={a.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${a.status === 'active' ? 'bg-green-500' : a.status === 'maintenance' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                        <span className="text-sm font-medium">{a.name}</span>
                        <span className="text-[10px] text-gray-600">added {a.addedDate}</span>
                      </div>
                      <span className={`text-sm font-bold ${a.avail >= 80 ? 'text-green-400' : a.avail >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{a.avail}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden flex">
                      <div className="h-full bg-green-600" style={{ width: `${(a.days.active / total) * 100}%` }}></div>
                      <div className="h-full bg-red-500" style={{ width: `${(a.days.maintenance / total) * 100}%` }}></div>
                      <div className="h-full bg-gray-500" style={{ width: `${(a.days.grounded / total) * 100}%` }}></div>
                    </div>
                    <div className="flex gap-3 mt-1 text-[10px] text-gray-600">
                      <span>{a.days.active}d active</span>
                      <span>{a.days.maintenance}d maint</span>
                      <span>{a.days.grounded}d down</span>
                      <span className="ml-auto">currently {a.status} ({a.daysSinceLast}d)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Row 3: Maintenance Forecast + Utilization side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Maintenance Forecast */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Maintenance Forecast</div>
            {paMetrics.length === 0 ? (
              <div className="text-center text-gray-600 py-6">No aircraft</div>
            ) : (
              <div className="space-y-2.5">
                {[...paMetrics].sort((a, b) => a.hoursRemaining - b.hoursRemaining).map(a => {
                  const pct = Math.max(0, Math.min(100, (a.totalHours / a.maintenanceInterval) * 100));
                  const isOverdue = a.hoursRemaining < 0;
                  const isWarn = a.hoursRemaining > 0 && a.hoursRemaining <= a.maintenanceInterval * 0.2;
                  return (
                    <div key={a.id} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.status === 'active' ? 'bg-green-500' : a.status === 'maintenance' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                      <div className="w-20 text-sm font-medium truncate">{a.name}</div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${isOverdue ? 'bg-red-500' : isWarn ? 'bg-yellow-500' : 'bg-green-600/70'}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                        </div>
                      </div>
                      <div className={`w-20 text-right text-xs font-mono font-semibold ${isOverdue ? 'text-red-400' : isWarn ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {isOverdue ? `OVER ${Math.abs(a.hoursRemaining).toFixed(0)}h` : a.hoursRemaining === 0 ? 'DUE' : `${a.hoursRemaining.toFixed(0)}h left`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Utilization Ranking */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Utilization{hasFlightLog ? ' — Period' : ' — Cumulative'}</div>
            {paMetrics.length === 0 ? (
              <div className="text-center text-gray-600 py-6">No aircraft</div>
            ) : (
              <div className="space-y-2">
                {[...paMetrics]
                  .map(a => ({ ...a, displayHours: a.periodHours !== null ? a.periodHours : a.totalHours }))
                  .sort((a, b) => b.displayHours - a.displayHours)
                  .map((a, index) => {
                    const maxH = Math.max(...paMetrics.map(ac => ac.periodHours !== null ? ac.periodHours : ac.totalHours), 1);
                    const barW = (a.displayHours / maxH) * 100;
                    return (
                      <div key={a.id} className="flex items-center gap-2">
                        <div className="w-5 text-xs text-gray-600 text-right">{index + 1}</div>
                        <div className="w-20 text-sm font-medium truncate">{a.name}</div>
                        <div className="flex-1 h-5 bg-gray-700 rounded overflow-hidden">
                          <div className={`h-full rounded flex items-center pl-2 text-[10px] font-semibold text-white/90 ${a.status === 'active' ? 'bg-blue-600' : a.status === 'maintenance' ? 'bg-red-600/80' : 'bg-gray-600'}`}
                            style={{ width: `${Math.max(barW, 20)}%` }}>
                            {a.displayHours.toFixed(1)}h
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {!hasFlightLog && <div className="text-[9px] text-gray-600 mt-2">Log flights to enable period-filtered hours</div>}
              </div>
            )}
          </div>
        </div>

        {/* Row 4: Action Items */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Icons.AlertTriangle /> Action Items
          </div>
          <div className="space-y-1.5">
            {paMetrics.filter(a => a.hoursRemaining < 0 && a.status === 'active').map(a => (
              <div key={`o-${a.id}`} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-900/15 border border-red-900/30">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                <span className="text-sm font-medium text-red-300">{a.name}</span>
                <span className="text-xs text-red-400/80">overdue {Math.abs(a.hoursRemaining).toFixed(1)} hrs</span>
                <button onClick={() => openStatusChangeModal(a.id, 'maintenance')} className="ml-auto text-xs px-2 py-1 rounded bg-red-600/30 hover:bg-red-600/50 text-red-300 transition">Send to Maint</button>
              </div>
            ))}
            {paMetrics.filter(a => a.hoursRemaining >= 0 && a.hoursRemaining <= a.maintenanceInterval * 0.2 && a.status === 'active').map(a => (
              <div key={`w-${a.id}`} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-yellow-900/10 border border-yellow-900/20">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0"></div>
                <span className="text-sm font-medium text-yellow-300">{a.name}</span>
                <span className="text-xs text-yellow-400/70">{a.hoursRemaining.toFixed(1)} hrs until service</span>
              </div>
            ))}
            {paMetrics.filter(a => a.status === 'grounded').map(a => (
              <div key={`g-${a.id}`} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-700/30 border border-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0"></div>
                <span className="text-sm font-medium text-gray-300">{a.name}</span>
                <span className="text-xs text-gray-500">grounded {a.daysSinceLast}d {a.statusHistory?.[0]?.reason ? `— ${a.statusHistory[0].reason}` : ''}</span>
                <button onClick={() => openStatusChangeModal(a.id, 'active')} className="ml-auto text-xs px-2 py-1 rounded bg-green-600/20 hover:bg-green-600/40 text-green-400 transition">Reactivate</button>
              </div>
            ))}
            {paMetrics.filter(a => a.status === 'maintenance').map(a => (
              <div key={`m-${a.id}`} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-orange-900/10 border border-orange-900/20">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0"></div>
                <span className="text-sm font-medium text-orange-300">{a.name}</span>
                <span className="text-xs text-orange-400/70">in maintenance {a.daysSinceLast}d {a.statusHistory?.[0]?.reason ? `— ${a.statusHistory[0].reason}` : ''}</span>
                <button onClick={() => openStatusChangeModal(a.id, 'active')} className="ml-auto text-xs px-2 py-1 rounded bg-green-600/20 hover:bg-green-600/40 text-green-400 transition">Return</button>
              </div>
            ))}
            {paMetrics.filter(a => a.status !== 'active' || a.hoursRemaining <= a.maintenanceInterval * 0.2).length === 0 && paMetrics.length > 0 && (
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-green-900/10 border border-green-900/20 text-green-400">
                <Icons.Check />
                <span className="text-sm">All systems operational — no action required</span>
              </div>
            )}
            {paMetrics.length === 0 && (
              <div className="text-center text-gray-600 py-4">No aircraft in selected period</div>
            )}
          </div>
        </div>
      </div>
      );
      })()}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
        >
          <div
            className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl modal-animate"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">Delete Aircraft?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete <strong>{aircraft.find(a => a.id === deleteConfirm)?.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetConfirm && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) setResetConfirm(false); }}
        >
          <div
            className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl modal-animate"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">Reset All Data?</h3>
            <p className="text-gray-400 mb-6">
              This will replace your entire fleet with sample aircraft. <strong>This cannot be undone.</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setResetConfirm(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {statusChangeModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) { setStatusChangeModal(null); setPendingEditSave(null); setStatusChangeReason(''); }}}
        >
          <div
            className="bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl modal-animate"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">
              {pendingEditSave ? 'Status Change Detected' : 'Change Status'}
            </h3>
            <p className="text-gray-400 mb-4">
              {pendingEditSave ? (
                <>You are changing <strong>{pendingEditSave.preparedData.name}</strong> status to{' '}</>
              ) : (
                <>Change <strong>{aircraft.find(a => a.id === statusChangeModal.aircraftId)?.name}</strong> to{' '}</>
              )}
              <span className={`font-medium ${
                statusChangeModal.newStatus === 'active' ? 'text-green-400' :
                statusChangeModal.newStatus === 'maintenance' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {statusChangeModal.newStatus}
              </span>
              {pendingEditSave && <span className="text-gray-500 block mt-1 text-sm">Please provide a reason for the status change.</span>}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Reason for change *</label>
              <input
                type="text"
                value={statusChangeReason}
                onChange={(e) => setStatusChangeReason(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder={
                  statusChangeModal.newStatus === 'active' ? 'e.g., Maintenance complete, Parts installed' :
                  statusChangeModal.newStatus === 'maintenance' ? 'e.g., Scheduled service, Motor replacement' :
                  'e.g., Awaiting parts, Regulatory hold'
                }
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setStatusChangeModal(null); setPendingEditSave(null); setStatusChangeReason(''); }}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={!statusChangeReason.trim()}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  statusChangeReason.trim() 
                    ? statusChangeModal.newStatus === 'active' ? 'bg-green-600 hover:bg-green-700' :
                      statusChangeModal.newStatus === 'maintenance' ? 'bg-red-600 hover:bg-red-700' :
                      'bg-gray-600 hover:bg-gray-500'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {pendingEditSave ? 'Save Changes' : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 overflow-y-auto modal-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="min-h-full flex items-start justify-center p-4 py-8">
            <div
              className="bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl modal-animate"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 rounded-t-xl">
              <h2 className="text-lg font-semibold">
                {editingId ? 'Edit Aircraft' : 'Add Aircraft'}
              </h2>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
              >
                <Icons.X />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-6">
              {/* Identity Section */}
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Identity</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Aircraft ID / Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => updateForm('name', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="e.g., RAVEN-01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Status</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFormData(prev => ({ ...prev, status: 'active' })); }}
                        className={`flex-1 py-2 rounded-lg transition text-sm cursor-pointer flex items-center justify-center gap-2 ${
                          formData.status === 'active' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-green-400"></span> Active
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFormData(prev => ({ ...prev, status: 'maintenance' })); }}
                        className={`flex-1 py-2 rounded-lg transition text-sm cursor-pointer flex items-center justify-center gap-2 ${
                          formData.status === 'maintenance' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-red-400"></span> Maintenance
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFormData(prev => ({ ...prev, status: 'grounded' })); }}
                        className={`flex-1 py-2 rounded-lg transition text-sm cursor-pointer flex items-center justify-center gap-2 ${
                          formData.status === 'grounded' 
                            ? 'bg-gray-500 text-white' 
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span> Grounded
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Airframe Section */}
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Airframe</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Airframe Type</label>
                    {airframeTypes.includes(formData.airframeType) ? (
                      <select
                        value={formData.airframeType || 'Quadcopter'}
                        onChange={(e) => updateForm('airframeType', e.target.value === 'Custom' ? '' : e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      >
                        {airframeTypes.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.airframeType || ''}
                          onChange={(e) => updateForm('airframeType', e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                          placeholder="Enter custom airframe type..."
                          
                        />
                        <button
                          type="button"
                          onClick={() => updateForm('airframeType', 'Quadcopter')}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
                          title="Back to list"
                        >
<Icons.XSmall />
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Total Flight Hours</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.totalHours === '' ? '' : formData.totalHours}
                      onChange={(e) => updateForm('totalHours', e.target.value === '' ? '' : e.target.value)}
                      onBlur={(e) => updateForm('totalHours', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Weight (lbs)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.weight === '' ? '' : formData.weight}
                      onChange={(e) => updateForm('weight', e.target.value === '' ? '' : e.target.value)}
                      onBlur={(e) => updateForm('weight', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Max Takeoff Weight (lbs)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.maxWeight === '' ? '' : formData.maxWeight}
                      onChange={(e) => updateForm('maxWeight', e.target.value === '' ? '' : e.target.value)}
                      onBlur={(e) => updateForm('maxWeight', e.target.value === '' ? 55 : parseFloat(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Maintenance Interval (hrs)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maintenanceInterval === '' ? '' : formData.maintenanceInterval}
                      onChange={(e) => updateForm('maintenanceInterval', e.target.value === '' ? '' : e.target.value)}
                      onBlur={(e) => updateForm('maintenanceInterval', e.target.value === '' ? 200 : parseFloat(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Last Flight Date</label>
                    <input
                      type="date"
                      value={formData.lastFlight || ''}
                      onChange={(e) => updateForm('lastFlight', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Systems Section */}
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Systems</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Flight Controller</label>
                    {fcOptions.includes(formData.flightController) ? (
                      <select
                        value={formData.flightController || 'Pixhawk 6C'}
                        onChange={(e) => updateForm('flightController', e.target.value === 'Custom' ? '' : e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      >
                        {fcOptions.map(fc => (
                          <option key={fc} value={fc}>{fc}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.flightController || ''}
                          onChange={(e) => updateForm('flightController', e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                          placeholder="Enter custom FC..."
                          
                        />
                        <button
                          type="button"
                          onClick={() => updateForm('flightController', 'Pixhawk 6C')}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
                          title="Back to list"
                        >
<Icons.XSmall />
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">FC Firmware Version</label>
                    <input
                      type="text"
                      value={formData.fcFirmware || ''}
                      onChange={(e) => updateForm('fcFirmware', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="e.g., ArduCopter 4.4.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Companion Computer</label>
                    {companionOptions.includes(formData.companionComputer) ? (
                      <select
                        value={formData.companionComputer || 'None'}
                        onChange={(e) => updateForm('companionComputer', e.target.value === 'Custom' ? '' : e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      >
                        {companionOptions.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.companionComputer || ''}
                          onChange={(e) => updateForm('companionComputer', e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                          placeholder="Enter custom computer..."
                          
                        />
                        <button
                          type="button"
                          onClick={() => updateForm('companionComputer', 'None')}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
                          title="Back to list"
                        >
<Icons.XSmall />
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Companion OS / Version</label>
                    <input
                      type="text"
                      value={formData.companionOS || ''}
                      onChange={(e) => updateForm('companionOS', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="e.g., Ubuntu 22.04"
                    />
                  </div>
                </div>
              </div>

              {/* Radio Section */}
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Radio Configuration</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Primary Link</label>
                    {radioOptions.includes(formData.primaryRadio) ? (
                      <select
                        value={formData.primaryRadio || 'LTE'}
                        onChange={(e) => updateForm('primaryRadio', e.target.value === 'Custom' ? '' : e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      >
                        {radioOptions.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                        <option value="Custom">Custom...</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.primaryRadio || ''}
                          onChange={(e) => updateForm('primaryRadio', e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                          placeholder="Enter custom radio type..."
                          
                        />
                        <button
                          type="button"
                          onClick={() => updateForm('primaryRadio', 'LTE')}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
                          title="Back to list"
                        >
<Icons.XSmall />
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Backup Link</label>
                    {radioOptions.includes(formData.backupRadio) ? (
                      <select
                        value={formData.backupRadio || 'None'}
                        onChange={(e) => updateForm('backupRadio', e.target.value === 'Custom' ? '' : e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      >
                        {radioOptions.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                        <option value="Custom">Custom...</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.backupRadio || ''}
                          onChange={(e) => updateForm('backupRadio', e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                          placeholder="Enter custom radio type..."
                          
                        />
                        <button
                          type="button"
                          onClick={() => updateForm('backupRadio', 'None')}
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm"
                          title="Back to list"
                        >
<Icons.XSmall />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => updateForm('location', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Hangar A, Field Site 1, Storage"
                />
              </div>

              {/* Notes Section */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => updateForm('notes', e.target.value)}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Additional notes, maintenance history, special configurations..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-4 border-t border-gray-700 bg-gray-800 rounded-b-xl">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 btn-primary-gradient rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <Icons.Check /> {editingId ? 'Save Changes' : 'Add Aircraft'}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
      {/* Footer */}
      <div className="mt-10 pb-2 text-center">
        <div className="text-[10px] text-gray-700 tracking-wider">
          UAS Fleet Tracker v{APP_VERSION}{dataPath && <span className="mx-2">·</span>}{dataPath && <span className="text-gray-700/60" title={dataPath}>{dataPath}</span>}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
