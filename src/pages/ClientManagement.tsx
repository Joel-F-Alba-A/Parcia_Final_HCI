import { useMemo, useState } from 'react';
import {
  Button,
  InlineNotification,
  Modal,
  Pagination,
  Search,
  Tag,
  TextInput,
  Tile,
} from '@carbon/react';
import { Checkmark, Edit, TrashCan, Close } from '@carbon/icons-react';
import { useData, type Client } from '../store/DataContext';

const segmentTag = {
  VIP: 'segment-tag--vip',
  Fiel: 'segment-tag--fiel',
  Normal: 'segment-tag--normal',
} as const;

export default function ClientManagement() {
  const { clients, updateClient, deleteClient } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Pick<Client, 'name' | 'cedula' | 'phone'>>({
    name: '',
    cedula: '',
    phone: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [notification, setNotification] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Client | null>(null);

  const filteredClients = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(search) ||
        client.cedula.includes(search) ||
        client.phone.includes(search),
    );
  }, [clients, searchTerm]);

  const currentItems = useMemo(() => {
    const first = (page - 1) * pageSize;
    return filteredClients.slice(first, first + pageSize);
  }, [filteredClients, page, pageSize]);

  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    setEditFormData({
      name: client.name,
      cedula: client.cedula,
      phone: client.phone,
    });
  };

  const handleSave = (id: string) => {
    updateClient(id, editFormData);
    setEditingId(null);
    setNotification('Cliente actualizado correctamente.');
    window.setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = (client: Client) => {
    setPendingDelete(client);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteClient(pendingDelete.id);
    setPendingDelete(null);
    setNotification('Cliente eliminado junto con sus compras asociadas.');
    window.setTimeout(() => setNotification(null), 3000);
  };

  return (
    <section className="management-page">
      <div className="overview-heading">
        <div>
          <p className="overview-eyebrow">Opticalia / Administracion</p>
          <h1>Gestion de clientes</h1>
          <p className="overview-subtitle">
            Consulta, edita y elimina perfiles de clientes manteniendo sus segmentos calculados.
          </p>
        </div>
      </div>

      {notification && (
        <InlineNotification
          className="purchase-notification"
          kind="success"
          lowContrast
          title="Gestion de clientes"
          subtitle={notification}
        />
      )}

      <Tile className="management-tile">
        <div className="table-toolbar">
          <h2>Clientes registrados</h2>
          <div className="table-actions">
            <Search
              id="manage-client-search"
              labelText="Buscar clientes"
              placeholder="Buscar por nombre, cedula o telefono"
              size="md"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="management-table-wrap">
          <table className="cds--data-table cds--data-table--zebra management-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cedula</th>
                <th>Telefono</th>
                <th>Categoria</th>
                <th>Compras</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((client) => {
                const isEditing = editingId === client.id;
                return (
                  <tr key={client.id}>
                    <td>
                      {isEditing ? (
                        <TextInput
                          id={`client-name-${client.id}`}
                          labelText="Nombre"
                          hideLabel
                          value={editFormData.name}
                          onChange={(event) => setEditFormData({ ...editFormData, name: event.target.value })}
                        />
                      ) : (
                        client.name
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <TextInput
                          id={`client-cedula-${client.id}`}
                          labelText="Cedula"
                          hideLabel
                          value={editFormData.cedula}
                          onChange={(event) => setEditFormData({ ...editFormData, cedula: event.target.value })}
                        />
                      ) : (
                        client.cedula || 'N/A'
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <TextInput
                          id={`client-phone-${client.id}`}
                          labelText="Telefono"
                          hideLabel
                          value={editFormData.phone}
                          onChange={(event) => setEditFormData({ ...editFormData, phone: event.target.value })}
                        />
                      ) : (
                        client.phone || 'N/A'
                      )}
                    </td>
                    <td>
                      <Tag type="gray" className={`segment-tag ${segmentTag[client.type]}`}>
                        {client.type}
                      </Tag>
                    </td>
                    <td>{client.purchaseCount}</td>
                    <td>
                      {isEditing ? (
                        <div className="row-actions">
                          <Button
                            kind="ghost"
                            size="sm"
                            renderIcon={Checkmark}
                            onClick={() => handleSave(client.id)}
                          >
                            Guardar
                          </Button>
                          <Button
                            kind="ghost"
                            size="sm"
                            renderIcon={Close}
                            onClick={() => setEditingId(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <div className="row-actions">
                          <Button
                            kind="ghost"
                            size="sm"
                            renderIcon={Edit}
                            onClick={() => handleEdit(client)}
                          >
                            Editar
                          </Button>
                          <Button
                            kind="danger--ghost"
                            size="sm"
                            renderIcon={TrashCan}
                            onClick={() => handleDelete(client)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
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
          pageSizes={[8, 16, 32]}
          totalItems={filteredClients.length}
          onChange={({ page: nextPage, pageSize: nextPageSize }) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          }}
        />
      </Tile>

      <Modal
        danger
        modalHeading="Eliminar registro"
        modalLabel="Gestion de clientes"
        primaryButtonText="Eliminar"
        secondaryButtonText="Cancelar"
        open={Boolean(pendingDelete)}
        onRequestClose={() => setPendingDelete(null)}
        onRequestSubmit={confirmDelete}
      >
        <p>
          ¿Esta seguro de borrar el registro de {pendingDelete?.name}? Tambien se eliminaran sus compras asociadas.
        </p>
      </Modal>
    </section>
  );
}
