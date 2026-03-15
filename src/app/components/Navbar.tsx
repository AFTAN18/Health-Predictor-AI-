import * as React from 'react';
import { NavLink } from 'react-router';
import { HeartPulse, LayoutDashboard, Stethoscope } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <HeartPulse size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              AIPredict
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                    isActive ? 'text-blue-600' : 'text-slate-600'
                  }`
                }
              >
                <LayoutDashboard size={16} />
                Dashboard
              </NavLink>
              <NavLink
                to="/predict"
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                    isActive ? 'text-blue-600' : 'text-slate-600'
                  }`
                }
              >
                <Stethoscope size={16} />
                New Prediction
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
