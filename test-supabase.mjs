import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jnvuzrsmdrsytqwpwpqv.supabase.co',
  'sb_publishable_NZDqfAKCTfy09dagZOnVUQ__lDaKZqY'
);

async function cleanUp() {
  const { data, error } = await supabase.from('orders').delete().eq('order_number', '#9999');
  console.log('Cleanup:', error || 'Success');
}

cleanUp();
