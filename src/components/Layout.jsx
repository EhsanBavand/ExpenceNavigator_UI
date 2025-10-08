import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TitleBar from "./TitleBar";
import { Container } from "react-bootstrap";

const Layout = ({ children, onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

            <div
                className="flex-grow-1 d-flex flex-column"
                style={{ marginLeft: sidebarOpen && window.innerWidth >= 768 ? 250 : 0 }}
            >
                <TitleBar onLogout={onLogout} onToggleSidebar={toggleSidebar} />
                <Container fluid className="p-4 flex-grow-1" style={{ overflowY: "auto" }}>
                    {children}
                </Container>
            </div>
        </div>
    );
};

export default Layout;
