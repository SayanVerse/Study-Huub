import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import SubjectPage from "./pages/SubjectPage";
import FolderPage from "./pages/FolderPage";
import NoteEditorPage from "./pages/NoteEditorPage";
import StarredPage from "./pages/StarredPage";
import StarredFolderView from "./pages/StarredFolderView";
import TagsPage from "./pages/TagsPage";
import { useLocation } from "react-router-dom";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/starred": "Starred",
  "/tags": "Tags",
};

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Study Hub";

  return (
    <div className="flex h-screen bg-slate-950 dark:bg-slate-950 overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} overflow-y-auto`}>
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
        />
        <main className="flex flex-col flex-1">{children}</main>
      </div>
    </div>
  );
};

function App() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={currentUser ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/starred"
        element={
          <ProtectedRoute>
            <AppLayout>
              <StarredPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/starred/:starredFolderId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <StarredFolderView />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subject/:subjectId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SubjectPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subject/:subjectId/folder/:folderId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <FolderPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subject/:subjectId/folder/:folderId/note/:noteId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <NoteEditorPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tags"
        element={
          <ProtectedRoute>
            <AppLayout>
              <TagsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
