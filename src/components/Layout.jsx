// import React, { useState, useEffect } from "react";
// import Sidebar from "./Sidebar";
// import TitleBar from "./TitleBar";
// import { Container } from "react-bootstrap";

// const Layout = ({ children, onLogout }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth >= 768) {
//         setSidebarOpen(true);
//       } else {
//         setSidebarOpen(false);
//       }
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

//   return (
//     <div className="d-flex" style={{ minHeight: "100vh" }}>
//       <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

//       <div
//         className="flex-grow-1 d-flex flex-column"
//         style={{
//           marginLeft: sidebarOpen && window.innerWidth >= 768 ? 250 : 0,
//         }}
//       >
//         <TitleBar onLogout={onLogout} onToggleSidebar={toggleSidebar} />
//         <Container
//           fluid
//           className="p-4 flex-grow-1"
//           style={{ overflowY: "auto" }}
//         >
//           {children}
//         </Container>
//       </div>
//     </div>
//   );
// };

// export default Layout;

// Layout.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TitleBar from "./TitleBar";
import { Container } from "react-bootstrap";
import "../CSS/Layout.css";

const Layout = ({ children, onLogout }) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      setSidebarOpen(desktop); // keep open on desktop; closed on mobile
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    // Only toggle on mobile; on desktop we keep it open
    if (!isDesktop) setSidebarOpen((prev) => !prev);
  };

  return (
    <div className={`layout-container ${isDesktop ? "desktop" : "mobile"}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        isDesktop={isDesktop}
      />
      <div
        className={`main-content ${isDesktop && sidebarOpen ? "sidebar-open" : ""}`}
      >
        <TitleBar onLogout={onLogout} onToggleSidebar={toggleSidebar} />
        <Container
          fluid
          className="p-4 flex-grow-1"
          style={{ overflowY: "auto" }}
        >
          {children}
        </Container>
      </div>
    </div>
  );
};

export default Layout;
