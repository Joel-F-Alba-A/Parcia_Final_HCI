import { useMemo, useState } from 'react';
import {
  Button,
  InlineNotification,
  Search,
  Select,
  SelectItem,
  TextArea,
  Tile,
} from '@carbon/react';
import { SendAlt } from '@carbon/icons-react';
import { useData } from '../store/DataContext';

export default function WhatsApp() {
  const { clients, whatsappMessages, sendWhatsAppMessage, selectedBranch } = useData();
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? '');
  const [message, setMessage] = useState('Hola {nombre}, te escribimos desde Opticalia para hacer seguimiento a tu solicitud.');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const selectedClient = clients.find((client) => client.id === selectedClientId) ?? clients[0];

  const filteredMessages = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return whatsappMessages
      .filter((item) => !search || item.clientName.toLowerCase().includes(search) || item.text.toLowerCase().includes(search))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [searchTerm, whatsappMessages]);

  const preview = selectedClient ? message.replaceAll('{nombre}', selectedClient.name) : message;

  const handleSend = () => {
    if (!selectedClient || !message.trim()) return;
    sendWhatsAppMessage(selectedClient.name, preview);
    setNotification(`Mensaje enviado a ${selectedClient.name}.`);
    window.setTimeout(() => setNotification(null), 3000);
  };

  return (
    <section className="whatsapp-page">
      <div className="overview-heading">
        <div>
          <p className="overview-eyebrow">Opticalia / Comunicacion</p>
          <h1>WhatsApp Empresa</h1>
          <p className="overview-subtitle">
            Central de mensajes de {selectedBranch}, con historial por cliente y envio rapido desde plantillas.
          </p>
        </div>
      </div>

      {notification && (
        <InlineNotification
          className="purchase-notification"
          kind="success"
          lowContrast
          title="WhatsApp Empresa"
          subtitle={notification}
        />
      )}

      <div className="whatsapp-layout">
        <Tile className="whatsapp-inbox-tile">
          <div className="table-toolbar">
            <h2>Conversaciones</h2>
            <div className="table-actions">
              <Search
                id="whatsapp-search"
                labelText="Buscar mensajes"
                placeholder="Buscar cliente o mensaje"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="whatsapp-thread-list">
            {filteredMessages.map((item) => (
              <article className={`whatsapp-message whatsapp-message--${item.direction}`} key={item.id}>
                <div>
                  <strong>{item.clientName}</strong>
                  <span>{new Date(item.timestamp).toLocaleString('es-CO')}</span>
                </div>
                <p>{item.text}</p>
              </article>
            ))}
            {filteredMessages.length === 0 && <p className="empty-state">No hay mensajes para esta sucursal.</p>}
          </div>
        </Tile>

        <Tile className="whatsapp-compose-tile">
          <h2>Enviar mensaje</h2>
          <Select
            id="whatsapp-client"
            labelText="Cliente"
            value={selectedClient?.id ?? ''}
            onChange={(event) => setSelectedClientId(event.target.value)}
          >
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id} text={`${client.name} - ${client.type}`} />
            ))}
          </Select>
          <TextArea
            id="whatsapp-message"
            labelText="Plantilla editable"
            value={message}
            rows={5}
            onChange={(event) => setMessage(event.target.value)}
          />
          <div className="campaign-preview">
            <span>Vista previa</span>
            <p>{preview}</p>
          </div>
          <Button renderIcon={SendAlt} disabled={!selectedClient || !message.trim()} onClick={handleSend}>
            Enviar WhatsApp
          </Button>
        </Tile>
      </div>
    </section>
  );
}
