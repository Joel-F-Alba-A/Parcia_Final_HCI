import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Button,
  Form,
  InlineNotification,
  Select,
  SelectItem,
  TextArea,
  TextInput,
  Tile,
} from '@carbon/react';
import { Add, CheckmarkFilled, Search, TrashCan, UserProfile } from '@carbon/icons-react';
import { useData } from '../store/DataContext';

const productOptions = ['Montura y Lentes', 'Solo Montura', 'Gafas de Sol', 'Montura Deportiva', 'Montura Infantil'];
const lensOptions = ['Monofocal', 'Bifocal', 'Progresivo', 'Ocupacional', 'Filtro Luz Azul', 'Fotocromatico'];

type PurchaseItemForm = {
  id: string;
  product: string;
  lensType: string;
  cost: string;
};

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

function createPurchaseItem(): PurchaseItemForm {
  return {
    id: Date.now().toString() + Math.random().toString(),
    product: productOptions[0],
    lensType: lensOptions[0],
    cost: '',
  };
}

export default function AddPurchase() {
  const { addPurchases, clients } = useData();
  const [searchValue, setSearchValue] = useState('');
  const [clientName, setClientName] = useState('');
  const [cedula, setCedula] = useState('');
  const [phone, setPhone] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemForm[]>(() => [createPurchaseItem()]);
  const [date, setDate] = useState(todayIso());
  const [comment, setComment] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const matchingClient = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();
    if (!normalized) return undefined;
    return clients.find(
      (client) => client.name.toLowerCase() === normalized || client.cedula === normalized,
    );
  }, [clients, searchValue]);

  useEffect(() => {
    if (matchingClient) {
      setClientName(matchingClient.name);
      setCedula(matchingClient.cedula || '');
      setPhone(matchingClient.phone || '');
      return;
    }

    if (/^\d+$/.test(searchValue)) {
      setCedula(searchValue);
      setClientName('');
    } else {
      setClientName(searchValue);
      setCedula('');
    }
  }, [matchingClient, searchValue]);

  const totalCost = purchaseItems.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);

  const updatePurchaseItem = (id: string, updates: Partial<PurchaseItemForm>) => {
    setPurchaseItems((items) => items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const addPurchaseItem = () => {
    setPurchaseItems((items) => [...items, createPurchaseItem()]);
  };

  const removePurchaseItem = (id: string) => {
    setPurchaseItems((items) => (items.length === 1 ? items : items.filter((item) => item.id !== id)));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validItems = purchaseItems.filter((item) => Number(item.cost) > 0);
    if (!clientName || !cedula || validItems.length !== purchaseItems.length) return;

    addPurchases(
      validItems.map((item, index) => ({
        product: item.product,
        lensType: item.lensType,
        cost: Number(item.cost),
        date,
        comment: [comment, purchaseItems.length > 1 ? `Item ${index + 1} de ${purchaseItems.length}` : '']
          .filter(Boolean)
          .join(' - '),
      })),
      clientName,
      cedula,
      phone,
    );

    setSearchValue('');
    setClientName('');
    setCedula('');
    setPhone('');
    setPurchaseItems([createPurchaseItem()]);
    setDate(todayIso());
    setComment('');
    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), 3500);
  };

  return (
    <section className="purchase-page">
      <div className="overview-heading">
        <div>
          <p className="overview-eyebrow">Opticalia / Operacion comercial</p>
          <h1>Anadir compra</h1>
          <p className="overview-subtitle">
            Registra una nueva venta, actualiza el historial del cliente y recalcula automaticamente su segmento.
          </p>
        </div>
      </div>

      {showSuccess && (
        <InlineNotification
          className="purchase-notification"
          kind="success"
          lowContrast
          title="Compra registrada"
          subtitle="La compra fue agregada al historial y el resumen gerencial ya puede reflejarla."
        />
      )}

      <div className="purchase-layout">
        <Tile className="purchase-form-tile">
          <Form onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="section-heading">
                <Search size={20} />
                <div>
                  <h2>Busqueda de cliente</h2>
                  <p>Usa nombre o cedula. Si existe, sus datos se completan automaticamente.</p>
                </div>
              </div>

              <TextInput
                id="client-search"
                labelText="Buscar cliente"
                placeholder="Ej. Juan Perez o 1098765432"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                list="client-suggestions"
              />
              <datalist id="client-suggestions">
                {clients.map((client) => (
                  <option key={client.id} value={client.name}>
                    {client.cedula ? `C.C: ${client.cedula}` : ''}
                  </option>
                ))}
                {clients.map((client) =>
                  client.cedula ? (
                    <option key={`${client.id}-cc`} value={client.cedula}>
                      {client.name}
                    </option>
                  ) : null,
                )}
              </datalist>
            </div>

            <div className="form-section">
              <div className="section-heading">
                <UserProfile size={20} />
                <div>
                  <h2>Datos del cliente</h2>
                  <p>Informacion minima para asociar la compra.</p>
                </div>
              </div>

              <div className="form-grid form-grid--three">
                <TextInput
                  id="client-name"
                  labelText="Nombre del cliente"
                  placeholder="Ej. Juan Perez"
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  required
                />
                <TextInput
                  id="client-id"
                  labelText="Cedula"
                  placeholder="Ej. 10987453"
                  value={cedula}
                  onChange={(event) => setCedula(event.target.value)}
                  required
                />
                <TextInput
                  id="client-phone"
                  labelText="Telefono"
                  placeholder="Ej. 3001234567"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-heading">
                <CheckmarkFilled size={20} />
                <div>
                  <h2>Detalle de compra</h2>
                  <p>Agrega uno o varios elementos asociados a la misma visita de compra.</p>
                </div>
              </div>

              <div className="purchase-items">
                {purchaseItems.map((item, index) => (
                  <div className="purchase-item-row" key={item.id}>
                    <span className="purchase-item-index">{index + 1}</span>
                    <Select
                      id={`purchase-product-${item.id}`}
                      labelText="Producto comprado"
                      value={item.product}
                      onChange={(event) => updatePurchaseItem(item.id, { product: event.target.value })}
                    >
                      {productOptions.map((option) => (
                        <SelectItem key={option} value={option} text={option} />
                      ))}
                    </Select>

                    <Select
                      id={`purchase-lens-${item.id}`}
                      labelText="Tipo de lente"
                      value={item.lensType}
                      onChange={(event) => updatePurchaseItem(item.id, { lensType: event.target.value })}
                    >
                      {lensOptions.map((option) => (
                        <SelectItem key={option} value={option} text={option} />
                      ))}
                    </Select>

                    <TextInput
                      id={`purchase-cost-${item.id}`}
                      labelText="Costo"
                      placeholder="Ej. 150000"
                      type="number"
                      min={1}
                      value={item.cost}
                      onChange={(event) => updatePurchaseItem(item.id, { cost: event.target.value })}
                      required
                    />

                    <Button
                      type="button"
                      kind="ghost"
                      size="sm"
                      renderIcon={TrashCan}
                      disabled={purchaseItems.length === 1}
                      onClick={() => removePurchaseItem(item.id)}
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
              </div>

              <div className="purchase-item-actions">
                <Button type="button" kind="tertiary" renderIcon={Add} onClick={addPurchaseItem}>
                  Agregar elemento
                </Button>
                <strong>Total: {totalCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</strong>
              </div>

              <div className="form-grid">
                <TextInput
                  id="purchase-date"
                  labelText="Fecha de compra"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                />
              </div>

              <TextArea
                id="purchase-comment"
                labelText="Comentario o descripcion"
                placeholder="Ej. Montura en promo, armazon negro y vidrios antireflejo."
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
              />
            </div>

            <Button className="purchase-submit" type="submit" renderIcon={Add}>
              Registrar compra
            </Button>
          </Form>
        </Tile>

        <Tile className="purchase-summary-tile">
          <h2>Impacto esperado</h2>
          <div className="summary-metric">
            <span>Cliente detectado</span>
            <strong>{matchingClient ? matchingClient.name : 'Nuevo o no encontrado'}</strong>
          </div>
          <div className="summary-metric">
            <span>Segmento actual</span>
            <strong>{matchingClient ? matchingClient.type : 'Normal inicial'}</strong>
          </div>
          <div className="summary-metric">
            <span>Compras previas</span>
            <strong>{matchingClient ? matchingClient.purchaseCount : 0}</strong>
          </div>
          <div className="summary-metric">
            <span>Elementos en esta compra</span>
            <strong>{purchaseItems.length}</strong>
          </div>
          <div className="summary-metric">
            <span>Total estimado</span>
            <strong>{totalCost.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</strong>
          </div>
          <p>
            Al registrar, cada elemento queda como una compra asociada al mismo cliente para preservar analiticas por
            producto, lente y segmento.
          </p>
        </Tile>
      </div>
    </section>
  );
}
