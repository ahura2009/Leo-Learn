"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { assetPath } from "@/lib/asset-path";
import { adminNavigation, isAdminRouteActive } from "@/lib/admin/navigation";
import { AdminIcon } from "./AdminIcon";

function Brand() {
  return <Link className="admin-brand" href="/admin" aria-label="Leo Learn admin overview"><Image src={assetPath("/images/leo-app-icon.png")} width={42} height={42} alt="" /><span>Leo Learn<small>ADMIN WORKSPACE</small></span></Link>;
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = [...new Set(adminNavigation.map((item) => item.group))];
  return <nav aria-label="Admin navigation" className="admin-navigation">{groups.map((group) => <div className="admin-nav-group" key={group}><p>{group}</p><ul>{adminNavigation.filter((item) => item.group === group).map((item) => <li key={item.href}><Link href={item.href} onClick={onNavigate} aria-current={isAdminRouteActive(pathname, item.href) ? "page" : undefined}><AdminIcon name={item.icon} /><span>{item.label}</span>{isAdminRouteActive(pathname, item.href) && <span className="admin-nav-indicator" aria-hidden="true" />}</Link></li>)}</ul></div>)}</nav>;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return <><Brand /><Navigation onNavigate={onNavigate} /><div className="admin-sidebar-note"><span className="admin-sidebar-note-icon" aria-hidden="true">✦</span><strong>A little progress, every day.</strong><p>A thoughtful space for everything that helps learners grow.</p><span>LEO IDENTITY · PHASE 02</span></div><Link href="/home" className="admin-student-link" onClick={onNavigate}>View student app <span aria-hidden="true">↗</span></Link></>;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const current = adminNavigation.find((item) => isAdminRouteActive(pathname, item.href));

  const closeMenu = () => dialogRef.current?.close();

  const containMenuFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex="0"]',
    )).filter((element) => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const media = window.matchMedia("(min-width: 1100px)");
    const handleResize = () => { if (media.matches && dialog.open) dialog.close(); };
    const restoreFocus = () => { if (!media.matches) menuRef.current?.focus(); };
    media.addEventListener("change", handleResize);
    dialog.addEventListener("close", restoreFocus);
    return () => { media.removeEventListener("change", handleResize); dialog.removeEventListener("close", restoreFocus); };
  }, []);

  const openMenu = () => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  };

  return <div className="admin-root">
    <a href="#admin-content" className="admin-skip-link">Skip to admin content</a>
    <aside className="admin-sidebar"><SidebarContent /></aside>
    <dialog ref={dialogRef} className="admin-mobile-dialog" aria-label="Admin menu" onKeyDown={containMenuFocus} onClick={(event) => { if (event.target === event.currentTarget) closeMenu(); }}>
      <div className="admin-mobile-sidebar"><button type="button" className="admin-menu-close" onClick={closeMenu} autoFocus aria-label="Close admin menu">×</button><SidebarContent onNavigate={closeMenu} /></div>
    </dialog>
    <div className="admin-workspace">
      <header className="admin-header"><div className="admin-header-location"><button ref={menuRef} type="button" className="admin-menu-button" onClick={openMenu} aria-label="Open admin menu" aria-haspopup="dialog"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg></button><span className="admin-header-parent">Workspace</span><span className="admin-header-divider" aria-hidden="true">/</span><span>{current?.label ?? "Admin"}</span></div><div className="admin-header-actions"><span className="admin-preview-pill"><span aria-hidden="true" />UI preview</span><Link className="admin-header-student" href="/home">Student app <span aria-hidden="true">↗</span></Link></div></header>
      <div className="admin-preview-notice" role="note"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v1" /></svg><p><strong>Preview workspace.</strong> Mock data only · No authentication · No changes are saved.</p></div>
      <main id="admin-content" tabIndex={-1} className="admin-main">{children}</main>
      <footer className="admin-footer"><span>Leo Learn <span aria-hidden="true">/</span> Built for learning, designed with care.</span><span>Phase 2 · Read-only preview</span></footer>
    </div>
  </div>;
}
