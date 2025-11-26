import { Metadata } from 'next';
import ImmobilierClient from './ImmobilierClient';

export const metadata: Metadata = {
  title: 'Immobilier - Achat, Vente et Location | MarcheFemme',
  description: 'Découvrez nos annonces immobilières : appartements, maisons, terrains et locaux commerciaux à vendre ou à louer.',
};

export default function ImmobilierPage() {
  return <ImmobilierClient />;
}