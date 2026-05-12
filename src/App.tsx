import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ListPage } from './pages/ListPage';
import { DetailPage } from './pages/DetailPage';
import { AddEditPage } from './pages/AddEditPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/restaurant/:id" element={<DetailPage />} />
        <Route path="/restaurant/:id/edit" element={<AddEditPage />} />
        <Route path="/add" element={<AddEditPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
