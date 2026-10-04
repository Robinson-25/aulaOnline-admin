import { asset } from './api.js';

export const Cover = ({ src, alt = '', className = '' }) =>
  src ? <img src={asset(src)} alt={alt} loading="lazy" className={`object-cover ${className}`} /> : <div className={`bg-gradient-to-br from-navy-700 to-navy-900 ${className}`} role="img" aria-label={alt} />;
