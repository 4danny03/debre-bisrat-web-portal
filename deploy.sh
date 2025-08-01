for fn in supabase/functions/*; do
  name=$(basename "$fn")
  npx supabase functions deploy "$name"
done
echo "All functions deployed successfully."