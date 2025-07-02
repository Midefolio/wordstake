import { Award, History, Play, Settings, Sparkles, Target, Trophy, Wallet, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../states";
import { useState } from "react";

const SideBar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen}: any) => {
    const currentUser = useSelector((state: RootState) => state.user.currentUser);
    const Navigate = useNavigate();

    const sidebarItems = [
        { active:"overview", id: 'overview', icon: <Target className="w-5 h-5" />, label: 'Overview' },
        { active:"play", id:'play', icon: <Play className="w-5 h-5" />, label: 'Play Game' },
        { active:"play",  sub:true, id: 'play', icon: <Play className="w-5 h-5" />, label: 'Play Game' },
        { active:"history", id: 'history', icon: <History className="w-5 h-5" />, label: 'Game History' },
        { active:"leaderboard", id: 'leaderboard', icon: <Trophy className="w-5 h-5" />, label: 'Leaderboard' },
        { active:"wallet", id: 'wallet', icon: <Wallet className="w-5 h-5" />, label: 'Wallet' },
        { active:"achievements", id: 'achievements', icon: <Award className="w-5 h-5" />, label: 'Achievements' },
        { active:"settings", id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
    ];


    return (<>
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                        <img src="stake.jpg" className="object-cover w-full h-full rounded-full " />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        WordStake
                    </span>
                </div>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-1 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="p-4 space-y-2">
                {sidebarItems.map((item) => (
                    <>
                      {!item.sub && <><button
                        key={item.id}
                        onClick={() => {
                            setActiveTab(item.active);
                            setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.active
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }`}
                    >
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                    </button></>}
                    </>
                ))}
            </nav>
        </div>

    </>);
}

export default SideBar;