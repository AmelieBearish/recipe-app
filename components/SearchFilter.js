'use client'
import { CATEGORIES } from '../lib/categories'

export default function SearchFilter({ searchText, onSearchChange, selectedCategory, onCategoryChange, sortOrder, onSortChange }) {
  return (
    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input
        type="text"
        placeholder="レシピを検索（スペース区切りでAND検索）"
        value={searchText}
        onChange={e => onSearchChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: '12px',
          border: '1px solid #F0E6DC',
          fontSize: '14px',
          color: '#3D2314',
          backgroundColor: '#FFFAF7',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onCategoryChange('')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid',
            borderColor: selectedCategory === '' ? '#C07048' : '#F0E6DC',
            backgroundColor: selectedCategory === '' ? '#C07048' : '#FFFAF7',
            color: selectedCategory === '' ? '#fff' : '#9A7060',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: selectedCategory === '' ? '600' : '400',
          }}
        >
          すべて
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: selectedCategory === cat.id ? '#C07048' : '#F0E6DC',
              backgroundColor: selectedCategory === cat.id ? '#C07048' : '#FFFAF7',
              color: selectedCategory === cat.id ? '#fff' : '#9A7060',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: selectedCategory === cat.id ? '600' : '400',
            }}
          >
            {cat.id}
          </button>
        ))}
      </div>
    <div style={{ display: 'flex', gap: '6px' }}>
        {[
          { value: 'createdAt', label: '新着順' },
          { value: 'likeCount', label: '好き！順' },
          { value: 'commentCount', label: 'コメント順' },
        ].map(option => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: sortOrder === option.value ? '#C07048' : '#F0E6DC',
              backgroundColor: sortOrder === option.value ? '#C07048' : '#FFFAF7',
              color: sortOrder === option.value ? '#fff' : '#9A7060',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: sortOrder === option.value ? '600' : '400',
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
