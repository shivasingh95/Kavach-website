import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <ScrollToTop />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}

