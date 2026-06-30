import { useState } from 'react';
import DictType from './DictType';
import DictData from './DictData';
import type { DictTypeItem } from './DictType';

export default function DictManagement() {
  const [view, setView] = useState<'type' | 'data'>('type');
  const [selectedType, setSelectedType] = useState<DictTypeItem | null>(null);

  const handleViewData = (dictType: DictTypeItem) => {
    setSelectedType(dictType);
    setView('data');
  };

  const handleBack = () => {
    setView('type');
    setSelectedType(null);
  };

  if (view === 'data' && selectedType) {
    return (
      <DictData
        dictCode={selectedType.code}
        dictName={selectedType.name}
        onBack={handleBack}
      />
    );
  }

  return <DictType onViewData={handleViewData} />;
}
