"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import RequestChat from '@/components/RequestChat';

export default function PemohonPermohonanChatPage() {
  const params = useParams();
  const requestId = params.id as string;

  return (
    <div className="h-full">
      <RequestChat 
        requestId={parseInt(requestId)} 
        userRole="PEMOHON"
      />
    </div>
  );
}