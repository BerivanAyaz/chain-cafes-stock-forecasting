// material-ui
// import { useTheme } from '@mui/material/styles'; // Artık tema kullanılmıyorsa bu satır silinebilir.

// Kendi SVG logonuzu projenize dahil edin
// Eğer Logo.js dosyanız 'src/layout/MainLayout/Logo' gibi bir klasördeyse,
// doğru yolu belirtmeniz gerekebilir. Genellikle aşağıdaki gibi çalışır:
import logo from 'assets/images/logo.svg';

// ==============================|| LOGO ||============================== //

export default function Logo() {
  return (
    /**
     * Eski <svg>...</svg> kodunun yerine aşağıdaki img etiketini kullanıyoruz.
     * 'width' değerini istediğiniz gibi ayarlayabilirsiniz.
     */
    <img src={logo} alt="Logo" width="100" />
  );
}