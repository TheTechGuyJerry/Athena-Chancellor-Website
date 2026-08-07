import { Routes, Route } from "react-router-dom";
import { SiteHeader, SiteFooter, CookieNotice } from "./components/SiteChrome";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { BlogPage } from "./pages/BlogPage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { EssayDetailPage } from "./pages/EssayDetailPage";
import { UnlockNaijaPage } from "./pages/UnlockNaijaPage";
import { MekariaMentorshipPage } from "./pages/MekariaMentorshipPage";
import { PressInquiryPage } from "./pages/PressInquiryPage";
import { TermsPage, PrivacyPage, CookiesPage } from "./pages/TermsPage";
import { AdminPage } from "./pages/AdminPage";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteHeader />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:slug" element={<EssayDetailPage />} />
          <Route path="/collectionsitem" element={<EssayDetailPage />} />
          <Route path="/unlocknaija" element={<UnlockNaijaPage />} />
          <Route path="/mekariamentorship" element={<MekariaMentorshipPage />} />
          <Route path="/pressinquiry" element={<PressInquiryPage />} />
          <Route path="/termsofservice" element={<TermsPage />} />
          <Route path="/privacypolicy" element={<PrivacyPage />} />
          <Route path="/cookiespolicy" element={<CookiesPage />} />
          
          {/* CMS Admin Routes */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/cms" element={<AdminPage />} />
          <Route path="/cms/login" element={<AdminPage />} />
          <Route path="/cms/admin" element={<AdminPage />} />
          <Route path="/admin/dashboard" element={<AdminPage />} />

          {/* Fallback route */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
      <SiteFooter />
      <CookieNotice />
    </div>
  );
}
