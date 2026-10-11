import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../../../lib/services/adminAuth.ts';
import { deleteTutorial } from '../../../../../../lib/services/studioService.ts';

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const deleted = await deleteTutorial(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Tutorial not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Tutorial deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error deleting tutorial.' },
      { status: 500 }
    );
  }
}
