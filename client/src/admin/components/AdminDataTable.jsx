// src/components/admin/AdminDataTable.jsx
import React, { useState } from 'react';
import '../../styles/AdminDataTable.scss';

const AdminDataTable = ({ 
  columns, 
  data, 
  onRowClick,
  pagination = true,
  itemsPerPage = 10
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calcul pour la pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = pagination 
    ? data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : data;
  
  return (
    <div className="admin-datatable">
      <table>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((item, rowIndex) => (
              <tr 
                key={rowIndex} 
                onClick={() => onRowClick && onRowClick(item)}
                className={onRowClick ? 'clickable' : ''}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render 
                      ? col.render(item[col.accessor], item)
                      : item[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="no-data">
                Aucune donnée à afficher
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {pagination && totalPages > 1 && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            &laquo;
          </button>
          
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            &lt;
          </button>
          
          <span>Page {currentPage} / {totalPages}</span>
          
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            &gt;
          </button>
          
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDataTable;
