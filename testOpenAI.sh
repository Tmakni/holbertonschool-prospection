#!/bin/bash

# Script de test pour l'intégration OpenAI
# Usage: ./testOpenAI.sh [JWT_TOKEN]

set -e

# Couleurs pour l'output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL de base
API_URL="http://localhost:3000/api"

# Token JWT (peut être passé en argument ou hardcodé pour les tests)
JWT_TOKEN="${1:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRvbS5tYWtuaUBnbWFpbC5jb20iLCJpYXQiOjE3NjA2MzIwMzksImV4cCI6MTc2MTIzNjgzOX0.yt2l7ONMVn6Ln-rLaDT6CJG4KqMijU6a3Gw_vTEbTqk}"

echo -e "${YELLOW}=== Test OpenAI Integration ===${NC}\n"

# Test 1: Vérifier si OpenAI_API_KEY est configuré
echo -e "${YELLOW}Test 1: Vérification de la clé OpenAI${NC}"
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}❌ OPENAI_API_KEY non définie${NC}"
    echo "   Ajoute ta clé dans le .env: OPENAI_API_KEY=sk-..."
else
    echo -e "${GREEN}✓ OPENAI_API_KEY est définie${NC}"
fi
echo ""

# Test 2: Générer un message avec OpenAI
echo -e "${YELLOW}Test 2: Générer un message avec OpenAI${NC}"
echo "Request to: POST $API_URL/messages/generate"

# D'abord, créer un contact de test
echo -e "${YELLOW}Création d'un contact de test...${NC}"
CONTACT_ID="test-contact-$(date +%s)"

# Mock: on utilise un ID fictif car on n'a pas d'API contact GET
CONTACT_ID="contact-123"

PAYLOAD=$(cat <<EOF
{
  "contactId": "$CONTACT_ID",
  "tone": "Professionnel & cordial",
  "objective": "Prise de rendez-vous",
  "campaign": "Découverte Q4",
  "highlights": ["Succès récent", "Cas d'usage SaaS"],
  "additionalContext": "Cliente travaille dans la FinTech",
  "useAI": true
}
EOF
)

echo "Payload:"
echo "$PAYLOAD" | jq '.'
echo ""

# Effectuer la requête
RESPONSE=$(curl -s -X POST "$API_URL/messages/generate" \
  -H "Content-Type: application/json" \
  -H "Cookie: token=$JWT_TOKEN" \
  -d "$PAYLOAD")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 3: Générer des variations
echo -e "${YELLOW}Test 3: Générer des variations de message${NC}"
echo "Request to: POST $API_URL/messages/generate-variations"

PAYLOAD=$(cat <<EOF
{
  "contactId": "$CONTACT_ID",
  "tone": "Convaincant",
  "objective": "Relance",
  "campaign": "Découverte Q4",
  "count": 2,
  "useAI": true
}
EOF
)

echo "Payload:"
echo "$PAYLOAD" | jq '.'
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/messages/generate-variations" \
  -H "Content-Type: application/json" \
  -H "Cookie: token=$JWT_TOKEN" \
  -d "$PAYLOAD")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 4: Récupérer l'historique
echo -e "${YELLOW}Test 4: Récupérer l'historique des messages${NC}"
echo "Request to: GET $API_URL/messages"

RESPONSE=$(curl -s -X GET "$API_URL/messages" \
  -H "Content-Type: application/json" \
  -H "Cookie: token=$JWT_TOKEN")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

echo -e "${GREEN}=== Tests terminés ===${NC}"
