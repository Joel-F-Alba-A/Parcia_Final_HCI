import { Fragment, useMemo, useState } from 'react';
import {
  Button,
  InlineNotification,
  Modal,
  Pagination,
  Search,
  TextArea,
  TextInput,
  Tile,
} from '@carbon/react';
import { Checkmark, Close, Edit, TrashCan, Chat } from '@carbon/icons-react';
import { useData, type Purchase } from '../store/DataContext';

type PurchaseEditForm = Pick<Purchase, 'product' | 'lensType' | 'date' | 'comment'> & {
  cost: string;
};

function formatCurrency(value: number) {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

export default function PurchaseManagement() {
  const { purchases, clients, updatePurchase, deletePurchase } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<PurchaseEditForm>({
    product: '',
    lensType: '',
    cost: '',
    date: '',
    comment: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [notification, setNotification] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Purchase | null>(null);

  const filteredPurchases = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return [...purchases]
      .filter((purchase) => {
        const client = clients.find((item) => item.id === purchase.clientId);
        return (
          client?.name.toLowerCase().includes(search) ||
          client?.cedula.includes(search) ||
          purchase.product.toLowerCase().includes(search) ||
          purchase.lensType.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [clients, purchases, searchTerm]);

  const currentItems = useMemo(() => {
    const first = (page - 1) * pageSize;
    return filteredPurchases.slice(first, first + pageSize);
  }, [filteredPurchases, page, pageSize]);

  const handleEdit = (purchase: Purchase) => {
    setEditingId(purchase.id);
    setEditFormData({
      product: purchase.product,
      lensType: purchase.lensType,
      cost: String(purchase.cost),
      date: purchase.date,
      comment: purchase.comment || '',
    });
  };

  const handleSave = (id: string) => {
    updatePurchase(id, {
      ...editFormData,
      cost: Number(editFormData.cost),
    });
    setEditingId(null);
    setNotification('Compra actualizada correctamente.');
    window.setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = (purchase: Purchase) => {
    setPendingDelete(purchase);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deletePurchase(pendingDelete.id);
    setPendingDelete(null);
    setNotification('Compra eliminada correctamente.');
    window.setTimeout(() => setNotification(null), 3000);
  };

  return (
    <section className="management-page">
      <div className="overview-heading">
        <div>
          <p className="overview-eyebrow">Opticalia / Administracion</p>
          <h1>Gestion de compras</h1>
          <p className="overview-subtitle">
            Revisa, edita o elimina transacciones registradas y sus notas asociadas.
          </p>
        </div>
      </div>

      {notification && (
        <InlineNotification
          className="purchase-notification"
          kind="success"
          lowContrast
          title="Gestion de compras"
          subtitle={notification}
        />
      )}

      <Tile className="management-tile">
        <div className="table-toolbar">
          <h2>Compras registradas</h2>
          <div className="table-actions">
            <Search
              id="manage-purchase-search"
              labelText="Buscar compras"
              placeholder="Buscar por cliente, cedula, producto o lente"
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
          <table className="cds--data-table cds--data-table--zebra management-table purchase-management-table">
            <thead>
              <tr>
                <th />
                <th>Cliente</th>
                <th>Producto</th>
                <th>Tipo lente</th>
                <th>Costo</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((purchase) => {
                const client = clients.find((item) => item.id === purchase.clientId);
                const isEditing = editingId === purchase.id;
                return (
                  <Fragment key={purchase.id}>
                    <tr>
                      <td>{purchase.comment ? <Chat size={16} /> : null}</td>
                      <td>
                        <strong>{client?.name ?? 'Cliente no registrado'}</strong>
                        <span>C.C: {client?.cedula ?? 'N/A'}</span>
                      </td>
                      <td>{purchase.product}</td>
                      <td>{purchase.lensType}</td>
                      <td>{formatCurrency(purchase.cost)}</td>
                      <td>{purchase.date}</td>
                      <td>
                        {isEditing ? (
                          <div className="row-actions">
                            <Button
                              kind="ghost"
                              size="sm"
                              renderIcon={Checkmark}
                              onClick={() => handleSave(purchase.id)}
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
                              onClick={() => handleEdit(purchase)}
                            >
                              Editar
                            </Button>
                            <Button
                              kind="danger--ghost"
                              size="sm"
                              renderIcon={TrashCan}
                              onClick={() => handleDelete(purchase)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {isEditing && (
                      <tr className="purchase-edit-panel-row">
                        <td colSpan={7}>
                          <div className="purchase-edit-panel">
                            <div className="section-heading">
                              <Edit size={20} />
                              <div>
                                <h2>Editar productos de la compra</h2>
                                <p>Modifica producto, lente, costo, fecha y nota asociada.</p>
                              </div>
                            </div>
                            <div className="form-grid">
                              <TextInput
                                id={`purchase-product-${purchase.id}`}
                                labelText="Producto"
                                value={editFormData.product}
                                onChange={(event) => setEditFormData({ ...editFormData, product: event.target.value })}
                              />
                              <TextInput
                                id={`purchase-lens-${purchase.id}`}
                                labelText="Tipo lente"
                                value={editFormData.lensType}
                                onChange={(event) => setEditFormData({ ...editFormData, lensType: event.target.value })}
                              />
                              <TextInput
                                id={`purchase-cost-${purchase.id}`}
                                labelText="Costo"
                                type="number"
                                value={editFormData.cost}
                                onChange={(event) => setEditFormData({ ...editFormData, cost: event.target.value })}
                              />
                              <TextInput
                                id={`purchase-date-${purchase.id}`}
                                labelText="Fecha"
                                type="date"
                                value={editFormData.date}
                                onChange={(event) => setEditFormData({ ...editFormData, date: event.target.value })}
                              />
                            </div>
                            <TextArea
                              id={`purchase-comment-${purchase.id}`}
                              labelText="Comentarios / notas de compra"
                              value={editFormData.comment}
                              onChange={(event) => setEditFormData({ ...editFormData, comment: event.target.value })}
                              rows={3}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No hay compras que coincidan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          backwardText="Pagina anterior"
          forwardText="Pagina siguiente"
          itemsPerPageText="Compras por pagina"
          page={page}
          pageSize={pageSize}
          pageSizes={[8, 16, 32]}
          totalItems={filteredPurchases.length}
          onChange={({ page: nextPage, pageSize: nextPageSize }) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          }}
        />
      </Tile>

      <Modal
        danger
        modalHeading="Eliminar registro"
        modalLabel="Gestion de compras"
        primaryButtonText="Eliminar"
        secondaryButtonText="Cancelar"
        open={Boolean(pendingDelete)}
        onRequestClose={() => setPendingDelete(null)}
        onRequestSubmit={confirmDelete}
      >
        <p>¿Esta seguro de borrar esta compra? Esta accion afectara el resumen gerencial.</p>
      </Modal>
    </section>
  );
}
