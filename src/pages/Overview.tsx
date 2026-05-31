import { useMemo, useState } from 'react';
import {
  Button,
  DataTable,
  DatePicker,
  DatePickerInput,
  Dropdown,
  Search as CarbonSearch,
  Tag,
  Tile,
} from '@carbon/react';
import {
  ArrowUp,
  Download,
  Filter,
  Money,
  OverflowMenuVertical,
  Star,
  UserMultiple,
  View,
} from '@carbon/icons-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useData, type Client, type Purchase } from '../store/DataContext';
import { chartTokens, colorTokens } from '../styles/tokens';

const carbonBlues = chartTokens.blueSeries;
const segmentColors = chartTokens.segmentSeries;

const tableHeaders = [
  { key: 'id', header: 'ID compra' },
  { key: 'date', header: 'Fecha' },
  { key: 'client', header: 'Cliente' },
  { key: 'product', header: 'Producto' },
  { key: 'lensType', header: 'Tipo de lente' },
  { key: 'cost', header: 'Monto' },
  { key: 'segment', header: 'Segmento' },
  { key: 'actions', header: '' },
];

function formatCurrency(value: number) {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

function StatTile({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ElementType;
  tone: 'blue' | 'green' | 'yellow' | 'red';
}) {
  return (
    <Tile className={`stat-tile stat-tile--${tone}`}>
      <div className="stat-tile__icon">
        <Icon size={24} />
      </div>
      <div>
        <p className="stat-tile__label">{label}</p>
        <strong className="stat-tile__value">{value}</strong>
        <span className="stat-tile__helper">
          <ArrowUp size={14} /> {helper}
        </span>
      </div>
    </Tile>
  );
}

function getClientName(purchase: Purchase, clients: Client[]) {
  return clients.find((client) => client.id === purchase.clientId)?.name ?? 'Cliente no registrado';
}

function getClientType(purchase: Purchase, clients: Client[]) {
  return clients.find((client) => client.id === purchase.clientId)?.type ?? 'Normal';
}

function renderRadialLabel(props: {
  name?: string;
  percent?: number;
  x?: number;
  y?: number;
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit';
}) {
  const { name, percent = 0, x = 0, y = 0, textAnchor = 'middle' } = props;
  if (percent < 0.045) return null;

  return (
    <text className="radial-label" x={x} y={y} textAnchor={textAnchor} dominantBaseline="central">
      {`${name} ${Math.round(percent * 100)}%`}
    </text>
  );
}

export default function Overview() {
  const { purchases, clients } = useData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [granularity, setGranularity] = useState('Mensual');
  const [datePickerResetKey, setDatePickerResetKey] = useState(0);

  const filteredPurchases = useMemo(
    () =>
      purchases.filter((purchase) => {
        const afterStart = !startDate || purchase.date >= startDate;
        const beforeEnd = !endDate || purchase.date <= endDate;
        return afterStart && beforeEnd;
      }),
    [endDate, purchases, startDate],
  );

  const totalSales = filteredPurchases.reduce((acc, curr) => acc + curr.cost, 0);
  const averageTicket = Math.round(totalSales / (filteredPurchases.length || 1));
  const vipClients = clients.filter((client) => client.type === 'VIP').length;

  const salesByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    filteredPurchases.forEach((purchase) => {
      const date = new Date(`${purchase.date}T00:00:00`);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key =
        granularity === 'Anual'
          ? String(year)
          : granularity === 'Trimestral'
            ? `${year}-T${Math.floor(month / 3) + 1}`
            : purchase.date.substring(0, 7);
      map[key] = (map[key] || 0) + purchase.cost;
    });
    return Object.keys(map)
      .map((month) => ({ month, ventas: map[month] }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredPurchases, granularity]);

  const productDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    filteredPurchases
      .filter((purchase) => purchase.product.toLowerCase().includes('montura') || purchase.product.toLowerCase().includes('gafas'))
      .forEach((purchase) => {
      map[purchase.product] = (map[purchase.product] || 0) + 1;
    });
    return Object.keys(map)
      .map((name) => ({ name, unidades: map[name] }))
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 8);
  }, [filteredPurchases]);

  const lensDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    filteredPurchases.filter((purchase) => purchase.lensType !== 'Ninguno').forEach((purchase) => {
      map[purchase.lensType] = (map[purchase.lensType] || 0) + 1;
    });
    return Object.keys(map)
      .map((name) => ({ name, value: map[name] }))
      .sort((a, b) => b.value - a.value);
  }, [filteredPurchases]);

  const lastMonthSegmentPurchases = useMemo(() => {
    const latestMonth = filteredPurchases
      .map((purchase) => purchase.date.substring(0, 7))
      .sort((a, b) => b.localeCompare(a))[0];
    const map: Record<'VIP' | 'Fiel' | 'Normal', number> = { VIP: 0, Fiel: 0, Normal: 0 };

    filteredPurchases.forEach((purchase) => {
      if (purchase.date.substring(0, 7) !== latestMonth) return;
      map[getClientType(purchase, clients)] += 1;
    });

    return {
      latestMonth: latestMonth ?? 'Sin datos',
      data: [
        { name: 'VIP', compras: map.VIP },
        { name: 'Fiel', compras: map.Fiel },
        { name: 'Normal', compras: map.Normal },
      ],
    };
  }, [clients, filteredPurchases]);

  const clientSegments = useMemo(() => {
    const counts = { VIP: 0, Fiel: 0, Normal: 0 };
    clients.forEach((client) => {
      counts[client.type] += 1;
    });
    return [
      { name: 'VIP', value: counts.VIP },
      { name: 'Fiel', value: counts.Fiel },
      { name: 'Normal', value: counts.Normal },
    ];
  }, [clients]);

  const recentPurchases = useMemo(
    () =>
      [...filteredPurchases]
        .filter((purchase) => {
          const search = tableSearch.trim().toLowerCase();
          if (!search) return true;
          return (
            getClientName(purchase, clients).toLowerCase().includes(search) ||
            purchase.product.toLowerCase().includes(search) ||
            purchase.lensType.toLowerCase().includes(search)
          );
        })
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 6)
        .map((purchase) => ({
          id: purchase.id,
          date: purchase.date,
          client: getClientName(purchase, clients),
          product: purchase.product,
          lensType: purchase.lensType,
          cost: formatCurrency(purchase.cost),
          segment: getClientType(purchase, clients),
          actions: 'acciones',
        })),
    [clients, filteredPurchases, tableSearch],
  );

  const exportReport = () => {
    const headers = ['fecha', 'cliente', 'producto', 'tipo_lente', 'monto', 'segmento'];
    const lines = filteredPurchases.map((purchase) =>
      [
        purchase.date,
        getClientName(purchase, clients),
        purchase.product,
        purchase.lensType,
        purchase.cost,
        getClientType(purchase, clients),
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(','),
    );
    const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'opticalia-resumen-gerencial.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="overview-page">
      <div className="overview-heading">
        <div>
          <p className="overview-eyebrow">Opticalia / Resumen</p>
          <h1>Resumen gerencial</h1>
          <p className="overview-subtitle">
            Vision general de ventas, clientes y comportamiento comercial reciente.
          </p>
        </div>
        <div className="overview-actions">
          <div className="date-range-panel">
            <DatePicker
              key={datePickerResetKey}
              datePickerType="range"
              locale="es"
              onChange={([start, end]) => {
                setStartDate(start ? start.toISOString().split('T')[0] : '');
                setEndDate(end ? end.toISOString().split('T')[0] : '');
              }}
            >
              <DatePickerInput id="start-date" placeholder="dd/mm/aaaa" labelText="Desde" size="md" />
              <DatePickerInput id="end-date" placeholder="dd/mm/aaaa" labelText="Hasta" size="md" />
            </DatePicker>
          </div>
          <Button renderIcon={Download} onClick={exportReport}>Exportar reporte</Button>
        </div>
      </div>

      <div className="stat-grid">
        <StatTile
          label="Ingresos totales"
          value={formatCurrency(totalSales)}
          helper="12% vs. periodo anterior"
          icon={Money}
          tone="blue"
        />
        <StatTile
          label="Total clientes base"
          value={clients.length.toLocaleString('es-CO')}
          helper="8% vs. periodo anterior"
          icon={UserMultiple}
          tone="green"
        />
        <StatTile
          label="Ticket promedio"
          value={formatCurrency(averageTicket)}
          helper="5% vs. periodo anterior"
          icon={View}
          tone="yellow"
        />
        <StatTile
          label="Clientes VIP"
          value={`${Math.round((vipClients / (clients.length || 1)) * 100)}%`}
          helper="3% vs. periodo anterior"
          icon={Star}
          tone="red"
        />
      </div>

      <div className="charts-grid">
        <Tile className="chart-tile chart-tile--wide">
          <div className="tile-header">
            <h2>Crecimiento de ingresos por mes</h2>
            <Dropdown
              id="sales-granularity"
              titleText=""
              label="Mensual"
              selectedItem={granularity}
              size="sm"
              items={['Mensual', 'Trimestral', 'Anual']}
              onChange={({ selectedItem }) => selectedItem && setGranularity(selectedItem)}
            />
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByMonth} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                <defs>
                  <linearGradient id="carbonBlueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colorTokens.blue60} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={colorTokens.blue60} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={colorTokens.gray20} vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: colorTokens.gray30 }} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value) / 1000000}M`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area dataKey="ventas" stroke={colorTokens.blue60} strokeWidth={2} fill="url(#carbonBlueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Tile>

        <Tile className="chart-tile">
          <div className="tile-header">
            <h2>Distribucion por tipo de lente</h2>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lensDistribution} layout="vertical" margin={{ top: 0, right: 44, left: 92, bottom: 0 }}>
                <CartesianGrid stroke={colorTokens.gray20} horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={150} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" name="Compras">
                  <LabelList dataKey="value" position="right" className="bar-value-label" />
                  {lensDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={carbonBlues[index % carbonBlues.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Tile>

        <Tile className="chart-tile">
          <div className="tile-header">
            <h2>Top monturas mas vendidas</h2>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productDistribution} layout="vertical" margin={{ top: 0, right: 44, left: 70, bottom: 0 }}>
                <CartesianGrid stroke={colorTokens.gray20} horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" width={132} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="unidades">
                  <LabelList dataKey="unidades" position="right" className="bar-value-label" />
                  {productDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={carbonBlues[index % carbonBlues.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Tile>

        <Tile className="chart-tile">
          <div className="tile-header">
            <h2>Segmentacion de clientes CRM</h2>
          </div>
          <div className="segment-layout">
            <div className="chart-frame chart-frame--compact">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientSegments}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={78}
                    label={renderRadialLabel}
                    labelLine={{ stroke: colorTokens.gray50, strokeWidth: 1 }}
                  >
                    {clientSegments.map((entry, index) => (
                      <Cell key={entry.name} fill={segmentColors[index % segmentColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="segment-list">
              {clientSegments.map((segment, index) => (
                <div key={segment.name}>
                  <span style={{ backgroundColor: segmentColors[index] }} />
                  <strong>{segment.name}</strong>
                  <p>{segment.value} clientes</p>
                </div>
              ))}
            </div>
          </div>
        </Tile>

        <Tile className="chart-tile">
          <div className="tile-header">
            <div>
              <h2>Compras por segmento</h2>
              <p className="tile-caption">Mes mas reciente: {lastMonthSegmentPurchases.latestMonth}</p>
            </div>
          </div>
          <div className="chart-frame chart-frame--compact">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lastMonthSegmentPurchases.data}
                  dataKey="compras"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={82}
                  label={renderRadialLabel}
                  labelLine={{ stroke: colorTokens.gray50, strokeWidth: 1 }}
                >
                  {lastMonthSegmentPurchases.data.map((entry, index) => (
                    <Cell key={entry.name} fill={segmentColors[index % segmentColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Tile>
      </div>

      <Tile className="table-tile">
        <div className="table-toolbar">
          <h2>Compras recientes</h2>
          <div className="table-actions">
            <CarbonSearch
              id="purchase-search"
              labelText="Buscar compras"
              placeholder="Buscar compras..."
              size="md"
              value={tableSearch}
              onChange={(event) => setTableSearch(event.target.value)}
            />
            <Button
              kind="tertiary"
              renderIcon={Filter}
              onClick={() => {
                setTableSearch('');
                setStartDate('');
                setEndDate('');
                setDatePickerResetKey((current) => current + 1);
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
        <DataTable rows={recentPurchases} headers={tableHeaders} size="md">
          {({ rows, headers, getRowProps, getTableProps }) => (
            <table {...getTableProps()} className="cds--data-table cds--data-table--zebra">
              <thead>
                <tr>
                  {headers.map((header) => (
                    <th key={header.key}>{header.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr {...getRowProps({ row })} key={row.id}>
                    {row.cells.map((cell) => (
                      <td key={cell.id}>
                        {cell.info.header === 'segment' ? (
                          <Tag
                            type="gray"
                            className={`segment-tag ${
                              cell.value === 'VIP'
                                ? 'segment-tag--vip'
                                : cell.value === 'Fiel'
                                  ? 'segment-tag--fiel'
                                  : 'segment-tag--normal'
                            }`}
                          >
                            {cell.value}
                          </Tag>
                        ) : cell.info.header === 'actions' ? (
                          <OverflowMenuVertical size={18} />
                        ) : (
                          cell.value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataTable>
      </Tile>
    </section>
  );
}
