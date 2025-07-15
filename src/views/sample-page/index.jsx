import { useEffect, useState, useMemo } from 'react';

// --- Gerekli Kütüphaneler ---
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

// Proje İçi Bileşenler
import MainCard from 'ui-component/cards/MainCard';

// Grafik Kütüphanesi: Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// --- Veri İşleme Fonksiyonları ---
const cleanAndParseNumber = (value) => { if (value === null || value === undefined) return null; const strValue = String(value); const cleanedValue = strValue.replace(/ |\*|"|\s/g, '').replace(',', '.'); if (cleanedValue === '') return null; const number = parseFloat(cleanedValue); return isNaN(number) ? null : number; };
const cleanProductName = (name) => { if (typeof name !== 'string') return ''; return name.replace(/ /g, ' ').trim(); };
const parseCSV = (csvText) => { const lines = csvText.trim().split('\n'); if (lines.length < 2) return []; const headers = lines[0].split(',').map((h) => h.trim()); return lines.slice(1).map((line) => { if (!line.trim()) return null; const values = line.split(',').map((v) => v.trim()); return headers.reduce((obj, header, index) => { let value = values[index] || ''; if (['Miktar', 'Tutar', 'İkram', 'İndirim', 'Net Tutar', 'Onerilen_Min_Stok'].includes(header)) { obj[header] = cleanAndParseNumber(value); } else if (header === 'Ürün') { obj[header] = cleanProductName(value); } else { obj[header] = value; } return obj; }, {}); }).filter(Boolean); };
const parseDate = (dateString) => { if (!dateString) return null; const parts = dateString.split('/'); if (parts.length !== 3) return null; return new Date(parts[2], parts[0] - 1, parts[1]); };
const calculateLinearRegression = (data) => { if (!data || data.length < 2) return null; let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0; const n = data.length; data.forEach((point, index) => { const y = point.gecmisSatis; const x = index; sumX += x; sumY += y; sumXY += x * y; sumXX += x * x; }); const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX); const b = (sumY - m * sumX) / n; return isNaN(m) || isNaN(b) ? null : { m, b }; };

// ==============================|| GRAFİK SAYFASI ||============================== //

export default function ChartPage() {
  const [isLoading, setLoading] = useState(true);
  const [trainData, setTrainData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const TRAIN_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVidyTj9xAQ6YtQTeRnH2eFyjZkdabXDTdXvteA1_LaLDrP2rHGOWMQ11xSRbDltFMyMVhuYChcyTl/pub?gid=0&single=true&output=csv';
        const FORECAST_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSVidyTj9xAQ6YtQTeRnH2eFyjZkdabXDTdXvteA1_LaLDrP2rHGOWMQ11xSRbDltFMyMVhuYChcyTl/pub?gid=169020155&single=true&output=csv';
        const [trainResponse, forecastResponse] = await Promise.all([ fetch(TRAIN_DATA_URL), fetch(FORECAST_DATA_URL) ]);
        const trainText = await trainResponse.text(); const forecastText = await forecastResponse.text();
        const cleanTrainData = parseCSV(trainText); const cleanForecastData = parseCSV(forecastText);
        setTrainData(cleanTrainData); setForecastData(cleanForecastData);
        const initialProducts = [...new Set(cleanForecastData.map(item => item.Ürün).filter(Boolean))].sort();
        if (initialProducts.length > 0) { setSelectedProduct(initialProducts[0]); }
      } catch (error) { console.error("Veri çekilirken bir hata oluştu:", error); } 
      finally { setLoading(false); }
    };
    fetchAllData();
  }, []);
  
  const productOptions = useMemo(() => [...new Set(forecastData.map(item => item.Ürün).filter(Boolean))].sort(), [forecastData]);

  const { chartData, chartOptions } = useMemo(() => {
    if (!selectedProduct) return { chartData: { labels: [], datasets: [] }, chartOptions: {} };
    const pastSales = trainData.filter(item => item.Ürün === selectedProduct && item.Miktar != null).map(item => ({ date: parseDate(item.Tarih), tarih: item.Tarih, gecmisSatis: item.Miktar })).filter(item => item.date).sort((a, b) => a.date - b.date);
    const futureForecasts = forecastData.filter(item => item.Ürün === selectedProduct).map(item => ({ date: parseDate(item.Tarih), tarih: item.Tarih, gelecekTahmin: item.Onerilen_Min_Stok })).filter(item => item.date);
    const regression = calculateLinearRegression(pastSales);
    const combinedData = [...pastSales, ...futureForecasts].sort((a, b) => a.date - b.date);
    const uniqueData = Array.from(new Map(combinedData.map(item => [item.tarih, item])).values());
    const labels = uniqueData.map(d => d.tarih);
    const forecastStartIndex = uniqueData.findIndex(d => d.gelecekTahmin != null);
    const data = { labels: labels, datasets: [ { label: 'Geçmiş Gerçek Satışlar', data: uniqueData.map(d => d.gecmisSatis), borderColor: '#0284c7', tension: 0.1, pointRadius: 4, spanGaps: false }, { label: 'Gelecek Tahminleri (Hibrit Model)', data: uniqueData.map(d => d.gelecekTahmin), borderColor: '#f97316', borderDash: [5, 5], tension: 0.1, pointRadius: 4, spanGaps: false }, { label: 'Algılanan Trend', data: uniqueData.map((d, index) => (regression && d.gecmisSatis != null) ? regression.m * index + regression.b : null), borderColor: '#22c55e', borderDash: [3, 3], tension: 0.1, pointRadius: 0, spanGaps: false } ] };
    const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, afterDraw: chart => { if (forecastStartIndex !== -1) { const ctx = chart.ctx; const xAxis = chart.scales.x; const yAxis = chart.scales.y; const x = xAxis.getPixelForValue(forecastStartIndex); ctx.save(); ctx.beginPath(); ctx.moveTo(x, yAxis.top); ctx.lineTo(x, yAxis.bottom); ctx.lineWidth = 2; ctx.strokeStyle = 'red'; ctx.setLineDash([6, 6]); ctx.stroke(); ctx.restore(); } } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'Günlük Satış Adedi' } } } };
    return { chartData: data, chartOptions: options };
  }, [selectedProduct, trainData, forecastData]);

  return (
    // Ana kart bileşeni, sayfanın tamamını kaplayacak
    <MainCard title="Hibrit Model ile Trend Tahmini">
      {/* Kartın içindeki düzeni Grid ile yapıyoruz */}
      <Grid container direction="column" spacing={2}>
        
        {/* Ürün Seçim Kutusu Alanı */}
        <Grid item xs={12} sm={8} md={6} lg={4}>
          <Autocomplete
            fullWidth
            value={selectedProduct}
            onChange={(event, newValue) => { setSelectedProduct(newValue); }}
            options={productOptions}
            disabled={isLoading}
            getOptionLabel={(option) => option || ""}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => <TextField {...params} label="Grafik için bir ürün seçin" />}
          />
        </Grid>
        
        {/* Grafik Alanı */}
        <Grid item xs={12}>
          {isLoading ? (
            <Skeleton variant="rectangular" height={500} />
          ) : (chartData.labels && chartData.labels.length > 0) ? (
            // Grafik konteynerinin yüksekliğini ve pozisyonunu belirtiyoruz
            <Box sx={{ height: '500px', position: 'relative' }}>
              <Line options={chartOptions} data={chartData} />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 500 }}>
              <Typography variant="h6" color="text.secondary">
                {selectedProduct ? `"${selectedProduct}" için gösterilecek grafik verisi bulunamadı.` : 'Lütfen bir ürün seçin.'}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </MainCard>
  );
}