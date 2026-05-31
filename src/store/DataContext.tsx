import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Purchase {
  id: string;
  clientId: string;
  product: string;
  lensType: string;
  cost: number;
  date: string;
  branch: Branch;
  comment?: string;
}

export type Branch = 'Sucursal Centro' | 'Tocancipa' | 'Cajica';

export interface Client {
  id: string;
  name: string;
  cedula: string;
  phone: string;
  type: 'VIP' | 'Fiel' | 'Normal';
  purchaseCount: number;
  branch: Branch;
}

export interface WhatsAppMsg {
  id: string;
  clientId: string;
  clientName: string;
  text: string;
  timestamp: string;
  direction: 'received' | 'sent';
  branch: Branch;
}

interface DataContextType {
  purchases: Purchase[];
  clients: Client[];
  whatsappMessages: WhatsAppMsg[];
  branches: Branch[];
  selectedBranch: Branch;
  setSelectedBranch: (branch: Branch) => void;
  addPurchase: (p: Omit<Purchase, 'id' | 'clientId' | 'branch'>, clientName: string, cedula: string, phone: string) => void;
  addPurchases: (items: Array<Omit<Purchase, 'id' | 'clientId' | 'branch'>>, clientName: string, cedula: string, phone: string) => void;
  updatePurchase: (id: string, p: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;
  updateClient: (id: string, c: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  sendWhatsAppMessage: (clientName: string, text: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);
export const branches: Branch[] = ['Sucursal Centro', 'Tocancipa', 'Cajica'];
const STORAGE_VERSION = 'v7';
const PURCHASES_KEY = `opticalia_purchases_${STORAGE_VERSION}`;
const CLIENTS_KEY = `opticalia_clients_${STORAGE_VERSION}`;
const WHATSAPP_KEY = `opticalia_whatsapp_${STORAGE_VERSION}`;

const getRandomBranch = (): Branch => branches[Math.floor(Math.random() * branches.length)];

// Weighted random date generator to create a non-linear realistic sales curve
const getRandomDateWeighted = () => {
  const currentYear = new Date().getFullYear();
  const r = Math.random();
  let month = 0;
  
  if (r < 0.05) month = 0; // Jan
  else if (r < 0.10) month = 1; // Feb
  else if (r < 0.16) month = 2; // Mar
  else if (r < 0.22) month = 3; // Apr
  else if (r < 0.30) month = 4; // May
  else if (r < 0.38) month = 5; // Jun
  else if (r < 0.44) month = 6; // Jul
  else if (r < 0.52) month = 7; // Aug
  else if (r < 0.60) month = 8; // Sep
  else if (r < 0.65) month = 9; // Oct
  else if (r < 0.75) month = 10; // Nov
  else month = 11; // Dec

  const day = Math.floor(Math.random() * 28) + 1;
  const dateStr = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return dateStr;
}

const generateRandomPhone = () => {
  const prefix = ['300', '301', '302', '310', '311', '312', '315', '316', '320', '321'];
  const pref = prefix[Math.floor(Math.random() * prefix.length)];
  const num = Math.floor(1000000 + Math.random() * 9000000);
  return `${pref}${num}`;
};

const generateRandomCedula = () => {
  return Math.floor(10000000 + Math.random() * 900000000).toString();
};

const fakeComments = [
  "Montura negra sencilla, le gustó mucho.",
  "Cambio de graduación después de 2 años.",
  "Buscaba antoreflejo porque pasa mucho tiempo en PC.",
  "Regalo para su mamá.",
  "Quería estilo aviador pero se decidió por rectangular.",
  "Pidió descuento por pago en efectivo.",
  "Estaba indeciso entre monofocal o progresivo.",
  "Montura deportiva para manejar en carretera.",
  "Terceras gafas que compró este año.",
  "Montura ligera de titanio.",
  ""
];

// Synthetic Data Generation
const generateSyntheticData = () => {
  const firstNames = ['María', 'Juan', 'Carlos', 'Ana', 'Luis', 'Elena', 'Roberto', 'Sofía', 'Daniela', 'Andrés', 'Jorge', 'Camila', 'Alejandro', 'Laura', 'Diego', 'Valeria', 'Sebastián', 'Gabriel', 'Valentina', 'Matías', 'Paula', 'Nicolás', 'Fernanda', 'Ricardo', 'Patricia', 'Manuel'];
  const lastNames = ['Gómez', 'Pérez', 'Ruiz', 'Torres', 'Mendoza', 'Rojas', 'Díaz', 'Castro', 'López', 'Silva', 'García', 'Martínez', 'Rodríguez', 'Hernández', 'Moreno', 'Vargas', 'Navarro', 'Suárez'];
  
  const clients: Client[] = [];
  
  // Specific simulated hardcoded names for demonstration purposes
  clients.push({ id: 'cli_carlos', name: 'Carlos Ruiz', cedula: '1098765432', phone: '3001234567', type: 'VIP', purchaseCount: 8, branch: 'Sucursal Centro' });
  clients.push({ id: 'cli_juan', name: 'Juan Pérez', cedula: '1122334455', phone: '3109876543', type: 'Fiel', purchaseCount: 4, branch: 'Sucursal Centro' });
  clients.push({ id: 'cli_maria', name: 'María Gómez', cedula: '2233445566', phone: '3151239876', type: 'Normal', purchaseCount: 2, branch: 'Tocancipa' });
  clients.push({ id: 'cli_ana', name: 'Ana Torres', cedula: '3344556677', phone: '3165432109', type: 'VIP', purchaseCount: 15, branch: 'Cajica' });
  clients.push({ id: 'cli_luis', name: 'Luis Mendoza', cedula: '4455667788', phone: '3012345678', type: 'Fiel', purchaseCount: 4, branch: 'Tocancipa' });

  // Generate remainder up to 140
  for (let i = 0; i < 135; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    const purchaseCount = Math.floor(Math.random() * 12) + 1;
    let type: 'VIP' | 'Fiel' | 'Normal' = 'Normal';
    if (purchaseCount > 5) type = 'VIP';
    else if (purchaseCount > 2) type = 'Fiel';

    clients.push({ 
      id: `cli_synth_${i}`, 
      name: `${fn} ${ln}`, 
      cedula: generateRandomCedula(),
      phone: generateRandomPhone(),
      type, 
      purchaseCount,
      branch: getRandomBranch()
    });
  }

  const products = ['Montura Ovalada', 'Montura Rectangular', 'Gafas de Sol de Diseñador', 'Montura tipo Aviador', 'Gafas de Lectura Básicas', 'Montura Infantil', 'Montura Deportiva Polarizada', 'Montura Titanio', 'Montura Acetato', 'Clip Solar', 'Lentes Oftálmicos'];
  const lenses = ['Monofocal', 'Bifocal', 'Progresivo Premium', 'Ocupacional', 'Progresivo Estándar', 'Transition Platinum', 'Antireflejo Blue Block', 'Filtro Luz Azul', 'Fotocromático'];
  
  const purchases: Purchase[] = [];

  clients.forEach(client => {
    for (let i = 0; i < client.purchaseCount; i++) {
        purchases.push({
          id: `pur_${Math.random()}`,
          clientId: client.id,
          product: products[Math.floor(Math.random() * products.length)],
          lensType: lenses[Math.floor(Math.random() * lenses.length)],
          cost: Math.floor(Math.random() * 500000) + 90000,
          date: getRandomDateWeighted(),
          branch: client.branch,
          comment: fakeComments[Math.floor(Math.random() * fakeComments.length)]
        });
    }
  });

  return { clients, purchases };
};

export const DataProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [selectedBranch, setSelectedBranch] = useState<Branch>('Sucursal Centro');
  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem(PURCHASES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) {}
    }
    const synthetic = generateSyntheticData();
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(synthetic.clients));
    return synthetic.purchases;
  });
  
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(CLIENTS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) {}
    }
    const synthetic = generateSyntheticData();
    return synthetic.clients;
  });

  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMsg[]>(() => {
    const saved = localStorage.getItem(WHATSAPP_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return [
      { id: '1', clientId: 'cli_carlos', clientName: 'Carlos Ruiz', text: 'Hola, quería confirmar cuándo estarán listos mis lentes.', timestamp: new Date(Date.now() - 1000000).toISOString(), direction: 'received', branch: 'Sucursal Centro' },
      { id: '2', clientId: 'cli_carlos', clientName: 'Carlos Ruiz', text: '¡Estarán listos el viernes a primera hora! Te enviaremos un mensaje automático cuando salgan de laboratorio.', timestamp: new Date(Date.now() - 500000).toISOString(), direction: 'sent', branch: 'Sucursal Centro' },
      { id: '3', clientId: 'cli_maria', clientName: 'María Gómez', text: 'Buenas tardes, deseo agendar revision visual en Tocancipa.', timestamp: new Date(Date.now() - 2500000).toISOString(), direction: 'received', branch: 'Tocancipa' },
      { id: '4', clientId: 'cli_ana', clientName: 'Ana Torres', text: 'Hola Ana, tu montura ya esta lista para recoger en Cajica.', timestamp: new Date(Date.now() - 3200000).toISOString(), direction: 'sent', branch: 'Cajica' }
    ];
  });

  // Cross-tab Synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
       if (e.key === WHATSAPP_KEY && e.newValue) {
         try { setWhatsappMessages(JSON.parse(e.newValue)); } catch(err) {}
       }
       if (e.key === CLIENTS_KEY && e.newValue) {
         try { setClients(JSON.parse(e.newValue)); } catch(err) {}
       }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    localStorage.setItem(WHATSAPP_KEY, JSON.stringify(whatsappMessages));
  }, [purchases, clients, whatsappMessages]);

  const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'clientId' | 'branch'>, clientName: string, cedula: string, phone: string) => {
    addPurchases([purchaseData], clientName, cedula, phone);
  };

  const addPurchases = (purchaseItems: Array<Omit<Purchase, 'id' | 'clientId' | 'branch'>>, clientName: string, cedula: string, phone: string) => {
    if (purchaseItems.length === 0) return;

    // Try to find client by cedula first, then name
    let currClient = clients.find(c => c.branch === selectedBranch && c.cedula === cedula) || clients.find(c => c.branch === selectedBranch && c.name.toLowerCase() === clientName.toLowerCase());
    let currentClients = [...clients];
    
    if (!currClient) {
      currClient = {
        id: Date.now().toString() + Math.random().toString(),
        name: clientName,
        cedula: cedula || generateRandomCedula(),
        phone: phone || generateRandomPhone(),
        type: 'Normal',
        purchaseCount: 0,
        branch: selectedBranch
      };
      currentClients.push(currClient);
    } else {
      // Update info if provided
      if (cedula && currClient.cedula !== cedula) currClient.cedula = cedula;
      if (phone && currClient.phone !== phone) currClient.phone = phone;
    }
    
    const cIndex = currentClients.findIndex(c => c.id === currClient!.id);
    const updatedCount = currentClients[cIndex].purchaseCount + purchaseItems.length;
    
    let newType: 'VIP' | 'Fiel' | 'Normal' = 'Normal';
    if (updatedCount > 5) newType = 'VIP';
    else if (updatedCount > 2) newType = 'Fiel';

    currentClients[cIndex] = { ...currentClients[cIndex], purchaseCount: updatedCount, type: newType };
    setClients(currentClients);

    const newPurchases: Purchase[] = purchaseItems.map((purchaseData) => ({
      ...purchaseData,
      id: Date.now().toString() + Math.random().toString(),
      clientId: currentClients[cIndex].id,
      branch: selectedBranch
    }));
    
    setPurchases(prev => [...prev, ...newPurchases]);
  };

  const updatePurchase = (id: string, updatedData: Partial<Purchase>) => {
    setPurchases(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  const deletePurchase = (id: string) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
  };

  const updateClient = (id: string, updatedData: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    setPurchases(prev => prev.filter(p => p.clientId !== id));
  };

  const sendWhatsAppMessage = (clientName: string, text: string) => {
    // Busca el id del cliente para agrupar chats
    const clientFound = clients.find(c => c.branch === selectedBranch && c.name.trim().toLowerCase() === clientName.trim().toLowerCase());
    const clientIdMatch = clientFound ? clientFound.id : Date.now().toString();

    setWhatsappMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random().toString(),
      clientId: clientIdMatch,
      clientName,
      text,
      timestamp: new Date().toISOString(),
      direction: 'sent',
      branch: selectedBranch
    }]);
  };

  const branchClients = clients.filter((client) => client.branch === selectedBranch);
  const branchPurchases = purchases.filter((purchase) => purchase.branch === selectedBranch);
  const branchMessages = whatsappMessages.filter((message) => message.branch === selectedBranch);

  return (
    <DataContext.Provider value={{ 
      purchases: branchPurchases,
      clients: branchClients,
      whatsappMessages: branchMessages,
      branches,
      selectedBranch,
      setSelectedBranch,
      addPurchase, addPurchases, updatePurchase, deletePurchase, updateClient, deleteClient, 
      sendWhatsAppMessage 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
};
