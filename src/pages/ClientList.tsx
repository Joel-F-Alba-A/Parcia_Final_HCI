import { Fragment, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  InlineNotification,
  Pagination,
  Search,
  Select,
  SelectItem,
  Tag,
  TextInput,
  Tile,
} from '@carbon/react';
import { ChevronDown, ChevronUp, SendAlt } from '@carbon/icons-react';
import { useData } from '../store/DataContext';

const segmentTag = {
  VIP: 'segment-tag--vip',
  Fiel: 'segment-tag--fiel',
  Normal: 'segment-tag--normal',
} as const;

const campaignTemplates = [
  {
    id: 'post-purchase',
    label: 'Seguimiento post-compra',
    objective: 'Acompanamiento posterior a la compra',
    text: 'Hola {nombre}, gracias por confiar en Opticalia. Como cliente {segmento}, tienes disponible {beneficio} hasta {vigencia}. Te atiende {asesor}.',
  },
  {
    id: 'vip-checkup',
    label: 'Revision prioritaria',
    objective: 'Activar clientes con historial de compra alto',
    text: 'Hola {nombre}, tienes {compras} compras registradas con nosotros. Te invitamos a {beneficio} hasta {vigencia}. Te atiende {asesor}.',
  },
  {
    id: 'renewal',
    label: 'Renovacion de lentes',
    objective: 'Impulsar renovacion y valoracion visual',
    text: 'Hola {nombre}, en Opticalia queremos ayudarte a revisar si tus lentes siguen adecuados. Podemos agendar {beneficio} hasta {vigencia}. Te atiende {asesor}.',
  },
];

function renderTemplate(
  template: string,
  client: { name: string; type: string; purchaseCount: number; cedula: string },
  fields: { beneficio: string; vigencia: string; asesor: string },
) {
  return template
    .replaceAll('{nombre}', client.name)
    .replaceAll('{segmento}', client.type)
    .replaceAll('{compras}', String(client.purchaseCount))
    .replaceAll('{cedula}', client.cedula || 'N/A')
    .replaceAll('{beneficio}', fields.beneficio)
    .replaceAll('{vigencia}', fields.vigencia)
    .replaceAll('{asesor}', fields.asesor);
}

export default function ClientList() {
  const { clients, sendWhatsAppMessage } = useData();
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(campaignTemplates[0].id);
  const [campaignFields, setCampaignFields] = useState({
    beneficio: 'revision visual prioritaria',
    vigencia: 'el sabado',
    asesor: 'Opticalia Sucursal Centro',
  });

  const filteredClients = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(search) || client.cedula.includes(search) || client.phone.includes(search);
      const matchesType = filterType === 'All' || client.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [clients, filterType, searchTerm]);

  const currentItems = useMemo(() => {
    const first = (page - 1) * pageSize;
    return filteredClients.slice(first, first + pageSize);
  }, [filteredClients, page, pageSize]);

  const allCurrentSelected = currentItems.length > 0 && currentItems.every((client) => selectedClients.has(client.id));

  const toggleClient = (id: string) => {
    setSelectedClients((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectCurrentPage = () => {
    setSelectedClients((current) => {
      const next = new Set(current);
      if (allCurrentSelected) currentItems.forEach((client) => next.delete(client.id));
      else currentItems.forEach((client) => next.add(client.id));
      return next;
    });
  };

  const handleSendMessage = () => {
    if (selectedClients.size === 0) return;
    const template = campaignTemplates.find((item) => item.id === selectedTemplate) ?? campaignTemplates[0];

    selectedClients.forEach((id) => {
      const client = clients.find((item) => item.id === id);
      if (client) sendWhatsAppMessage(client.name, renderTemplate(template.text, client, campaignFields));
    });

    setSelectedClients(new Set());
    setNotification(`Campana enviada a ${selectedClients.size} cliente${selectedClients.size === 1 ? '' : 's'}.`);
    window.setTimeout(() => setNotification(null), 3500);
  };

  const previewClient = clients.find((client) => selectedClients.has(client.id)) ?? currentItems[0];
  const activeTemplate = campaignTemplates.find((item) => item.id === selectedTemplate) ?? campaignTemplates[0];
  const previewMessage = previewClient ? renderTemplate(activeTemplate.text, previewClient, campaignFields) : activeTemplate.text;

  return (
    <section className="crm-page">
      <div className="overview-heading">
        <div>
          <p className="overview-eyebrow">Opticalia / Relacion con clientes</p>
          <h1>CRM y campanas</h1>
          <p className="overview-subtitle">
            Filtra clientes por segmento, revisa su informacion comercial y envia mensajes de campana.
          </p>
        </div>
      </div>

      {notification && (
        <InlineNotification
          className="purchase-notification"
          kind="success"
          lowContrast
          title="Mensajes enviados"
          subtitle={notification}
        />
      )}

      <div className="crm-layout">
        <Tile className="crm-table-tile">
          <div className="table-toolbar">
            <h2>Clientes</h2>
            <div className="table-actions">
              <Search
                id="client-search"
                labelText="Buscar clientes"
                placeholder="Buscar por nombre, cedula o telefono"
                size="md"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
              />
              <Select
                id="client-segment-filter"
                labelText="Segmento"
                hideLabel
                value={filterType}
                onChange={(event) => {
                  setFilterType(event.target.value);
                  setPage(1);
                }}
              >
                <SelectItem value="All" text="Todos" />
                <SelectItem value="VIP" text="VIP" />
                <SelectItem value="Fiel" text="Fiel" />
                <SelectItem value="Normal" text="Normal" />
              </Select>
            </div>
          </div>

          <div className="crm-table-wrap">
            <table className="cds--data-table cds--data-table--zebra crm-table">
              <thead>
                <tr>
                  <th className="crm-table__control-col">
                    <div className="crm-row-controls">
                      <span className="crm-row-controls__spacer" />
                      <Checkbox
                        id="select-current-page"
                        labelText=""
                        checked={allCurrentSelected}
                        onChange={selectCurrentPage}
                      />
                    </div>
                  </th>
                  <th>Cliente</th>
                  <th>Segmento</th>
                  <th>Compras</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((client) => (
                  <Fragment key={client.id}>
                    <tr>
                      <td className="crm-table__control-col">
                        <div className="crm-row-controls">
                          <button
                            className="crm-row-expander"
                            type="button"
                            aria-label={expandedId === client.id ? 'Contraer detalle' : 'Expandir detalle'}
                            aria-expanded={expandedId === client.id}
                            onClick={() => setExpandedId(expandedId === client.id ? null : client.id)}
                          >
                            {expandedId === client.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <Checkbox
                            id={`select-${client.id}`}
                            labelText=""
                            checked={selectedClients.has(client.id)}
                            onChange={() => toggleClient(client.id)}
                          />
                        </div>
                      </td>
                      <td>
                        <strong>{client.name}</strong>
                        <span>{client.cedula}</span>
                      </td>
                      <td>
                        <Tag type="gray" className={`segment-tag ${segmentTag[client.type]}`}>
                          {client.type}
                        </Tag>
                      </td>
                      <td>{client.purchaseCount}</td>
                    </tr>
                    {expandedId === client.id && (
                      <tr className="crm-detail-row">
                        <td colSpan={4}>
                          <div className="crm-detail-panel">
                            <div className="crm-detail-panel__summary">
                              <span>Cliente seleccionado</span>
                              <strong>{client.name}</strong>
                            </div>
                            <div>
                              <span>Cedula</span>
                              <strong>{client.cedula || 'N/A'}</strong>
                            </div>
                            <div>
                              <span>Telefono</span>
                              <strong>{client.phone || 'N/A'}</strong>
                            </div>
                            <div>
                              <span>Total compras</span>
                              <strong>{client.purchaseCount}</strong>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      No hay clientes que coincidan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            backwardText="Pagina anterior"
            forwardText="Pagina siguiente"
            itemsPerPageText="Clientes por pagina"
            page={page}
            pageSize={pageSize}
            pageSizes={[6, 12, 24]}
            totalItems={filteredClients.length}
            onChange={({ page: nextPage, pageSize: nextPageSize }) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            }}
          />
        </Tile>

        {selectedClients.size > 0 && (
        <Tile className="campaign-tile">
          <h2>Campana WhatsApp</h2>
          <div className="campaign-key-facts">
            <div className="summary-metric">
              <span>Clientes seleccionados</span>
              <strong>{selectedClients.size}</strong>
            </div>
            <div className="summary-metric">
              <span>Tipo de campana</span>
              <strong>{activeTemplate.label}</strong>
            </div>
            <div className="summary-metric">
              <span>Objetivo</span>
              <strong>{activeTemplate.objective}</strong>
            </div>
          </div>
          <Select
            id="campaign-template"
            labelText="Mensaje predeterminado"
            value={selectedTemplate}
            onChange={(event) => setSelectedTemplate(event.target.value)}
          >
            {campaignTemplates.map((template) => (
              <SelectItem key={template.id} value={template.id} text={template.label} />
            ))}
          </Select>
          <div className="campaign-fields">
            <TextInput
              id="campaign-benefit"
              labelText="Beneficio o accion"
              value={campaignFields.beneficio}
              onChange={(event) => setCampaignFields({ ...campaignFields, beneficio: event.target.value })}
            />
            <TextInput
              id="campaign-validity"
              labelText="Vigencia"
              value={campaignFields.vigencia}
              onChange={(event) => setCampaignFields({ ...campaignFields, vigencia: event.target.value })}
            />
            <TextInput
              id="campaign-advisor"
              labelText="Asesor / sede"
              value={campaignFields.asesor}
              onChange={(event) => setCampaignFields({ ...campaignFields, asesor: event.target.value })}
            />
          </div>
          <div className="campaign-preview">
            <span>Vista previa automatica</span>
            <p>{previewMessage || 'Selecciona una plantilla o escribe un mensaje.'}</p>
          </div>
          <Button
            className="campaign-submit"
            renderIcon={SendAlt}
            disabled={selectedClients.size === 0}
            onClick={handleSendMessage}
          >
            Enviar campana
          </Button>
        </Tile>
        )}
      </div>
    </section>
  );
}
