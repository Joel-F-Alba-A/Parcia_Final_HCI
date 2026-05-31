import {
  Content,
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  SideNav,
  SideNavItems,
  SideNavLink,
  SkipToContent,
  Theme,
} from '@carbon/react';
import {
  Analytics,
  Calendar,
  Chat,
  CustomerService,
  Dashboard,
  Help,
  Notification,
  Purchase,
  Search,
  Settings,
  UserAvatar,
  UserMultiple,
} from '@carbon/icons-react';
import type { CarbonIconType } from '@carbon/icons-react';
import { useState } from 'react';
import Overview from './pages/Overview';
import AddPurchase from './pages/AddPurchase';
import ClientList from './pages/ClientList';
import ClientManagement from './pages/ClientManagement';
import PurchaseManagement from './pages/PurchaseManagement';
import WhatsApp from './pages/WhatsApp';
import { useData } from './store/DataContext';

type ViewKey = 'overview' | 'add' | 'crm' | 'clients' | 'purchases' | 'whatsapp';
type HeaderPanelKey = 'search' | 'notifications' | 'settings' | 'user' | null;

const navItems: Array<{ id: ViewKey; label: string; icon: CarbonIconType }> = [
  { id: 'overview', label: 'Resumen Gerencial', icon: Dashboard },
  { id: 'add', label: 'Anadir Compra', icon: Purchase },
  { id: 'crm', label: 'CRM y Campanas', icon: Analytics },
  { id: 'clients', label: 'Gestion de Clientes', icon: UserMultiple },
  { id: 'purchases', label: 'Gestion de Compras', icon: Calendar },
  { id: 'whatsapp', label: 'WhatsApp Empresa', icon: Chat },
];

function Placeholder({ title }: { title: string }) {
  return (
    <section className="carbon-placeholder">
      <h1>{title}</h1>
      <p>Esta seccion se migrara en la siguiente fase manteniendo la funcionalidad del dashboard original.</p>
    </section>
  );
}

function HeaderActionPanel({ activePanel, onClose }: { activePanel: HeaderPanelKey; onClose: () => void }) {
  if (!activePanel) return null;

  const content = {
    search: {
      title: 'Busqueda global',
      body: 'Busca clientes, compras o mensajes desde los modulos activos. Usa los filtros de cada vista para acotar resultados.',
    },
    notifications: {
      title: 'Notificaciones',
      body: '3 compras recientes requieren seguimiento comercial y 2 clientes tienen mensajes entrantes sin responder.',
    },
    settings: {
      title: 'Ajustes',
      body: 'Preferencias de sucursal, filtros por defecto y tokens visuales quedan centralizados para mantener consistencia Carbon.',
    },
    user: {
      title: 'Gerente de sucursal',
      body: 'Perfil operativo con acceso a resumen, compras, clientes, CRM y WhatsApp empresarial.',
    },
  }[activePanel];

  return (
    <div className="header-action-panel">
      <div>
        <h2>{content.title}</h2>
        <p>{content.body}</p>
      </div>
      <button type="button" onClick={onClose}>
        Cerrar
      </button>
    </div>
  );
}

export default function App() {
  const { branches, selectedBranch, setSelectedBranch } = useData();
  const [activeView, setActiveView] = useState<ViewKey>('overview');
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(true);
  const [activeHeaderPanel, setActiveHeaderPanel] = useState<HeaderPanelKey>(null);
  const activeItem = navItems.find((item) => item.id === activeView);

  const toggleHeaderPanel = (panel: Exclude<HeaderPanelKey, null>) => {
    setActiveHeaderPanel((current) => (current === panel ? null : panel));
  };

  return (
    <div className={`carbon-shell ${isSideNavExpanded ? '' : 'carbon-shell--nav-collapsed'}`}>
      <Theme theme="g100">
        <Header aria-label="Opticalia Carbon Dashboard">
          <SkipToContent />
          <HeaderMenuButton
            aria-label={isSideNavExpanded ? 'Cerrar navegacion' : 'Abrir navegacion'}
            isCollapsible
            isActive={isSideNavExpanded}
            onClick={() => setIsSideNavExpanded((value) => !value)}
          />
          <HeaderName href="#" prefix="">
            Opticalia Analytics
          </HeaderName>
          <HeaderNavigation aria-label="Opticalia">
            <label className="header-branch-selector">
              <span>Sucursal</span>
              <select
                value={selectedBranch}
                onChange={(event) => setSelectedBranch(event.target.value as typeof selectedBranch)}
              >
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </label>
          </HeaderNavigation>
          <HeaderGlobalBar>
            <HeaderGlobalAction aria-label="Buscar" isActive={activeHeaderPanel === 'search'} onClick={() => toggleHeaderPanel('search')}>
              <Search size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction aria-label="Notificaciones" isActive={activeHeaderPanel === 'notifications'} onClick={() => toggleHeaderPanel('notifications')}>
              <Notification size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction aria-label="Ajustes" isActive={activeHeaderPanel === 'settings'} onClick={() => toggleHeaderPanel('settings')}>
              <Settings size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction aria-label="Gerente Sucursal" isActive={activeHeaderPanel === 'user'} onClick={() => toggleHeaderPanel('user')}>
              <UserAvatar size={20} />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
        </Header>
        <HeaderActionPanel activePanel={activeHeaderPanel} onClose={() => setActiveHeaderPanel(null)} />

        <SideNav
          aria-label="Navegacion principal"
          expanded
          isPersistent
          className={`carbon-sidenav ${isSideNavExpanded ? '' : 'carbon-sidenav--collapsed'}`}
        >
          <SideNavItems>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <SideNavLink
                  key={item.id}
                  href="#"
                  isActive={activeView === item.id}
                  renderIcon={Icon}
                  onClick={(event) => {
                    event.preventDefault();
                    setActiveView(item.id);
                  }}
                >
                  {item.label}
                </SideNavLink>
              );
            })}
          </SideNavItems>
          <div className="sidenav-footer">
            <SideNavLink href="#" renderIcon={Help} onClick={(event) => event.preventDefault()}>
              Ayuda
            </SideNavLink>
            <SideNavLink href="#" renderIcon={CustomerService} onClick={(event) => event.preventDefault()}>
              Soporte
            </SideNavLink>
          </div>
        </SideNav>
      </Theme>

      <Theme theme="white">
        <Content className="carbon-content" id="main-content">
          {activeView === 'overview' && <Overview />}
          {activeView === 'add' && <AddPurchase />}
          {activeView === 'crm' && <ClientList />}
          {activeView === 'clients' && <ClientManagement />}
          {activeView === 'purchases' && <PurchaseManagement />}
          {activeView === 'whatsapp' && <WhatsApp />}
          {!['overview', 'add', 'crm', 'clients', 'purchases', 'whatsapp'].includes(activeView) && (
            <Placeholder title={activeItem?.label ?? 'Opticalia'} />
          )}
        </Content>
      </Theme>
    </div>
  );
}
