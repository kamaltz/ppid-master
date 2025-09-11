"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import KeberatanChat from '@/components/KeberatanChat';

export default function PemohonKeberatanChatPage() {
  const params = useParams();
  const keberatanId = params.id as string;

  return (
    <div className="h-full">
      <KeberatanChat 
        keberatanId={parseInt(keberatanId)} 
        userRole="PEMOHON"
      />
    </div>
  );
}