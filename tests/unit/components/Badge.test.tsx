import { render, screen } from '@testing-library/react';
import { Badge, TradeStatusBadge } from '@/components/ui/Badge';

describe('Badge Component', () => {
  it('renders children correctly', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('bg-slate-800/60', 'text-slate-300');
  });

  it('applies success variant styles', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge).toHaveClass('bg-emerald-500/20', 'text-emerald-400');
  });

  it('applies warning variant styles', () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText('Warning');
    expect(badge).toHaveClass('bg-amber-500/20', 'text-amber-400');
  });

  it('applies danger variant styles', () => {
    render(<Badge variant="danger">Danger</Badge>);
    const badge = screen.getByText('Danger');
    expect(badge).toHaveClass('bg-red-500/20', 'text-red-400');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('custom-class');
  });
});

describe('TradeStatusBadge Component', () => {
  it('renders PENDING status with warning style', () => {
    render(<TradeStatusBadge status="PENDING" />);
    const badge = screen.getByText('PENDING');
    expect(badge).toHaveClass('bg-amber-500/20', 'text-amber-400');
  });

  it('renders WON status with success style', () => {
    render(<TradeStatusBadge status="WON" />);
    const badge = screen.getByText('WON');
    expect(badge).toHaveClass('bg-emerald-500/20', 'text-emerald-400');
  });

  it('renders LOST status with danger style', () => {
    render(<TradeStatusBadge status="LOST" />);
    const badge = screen.getByText('LOST');
    expect(badge).toHaveClass('bg-red-500/20', 'text-red-400');
  });

  it('renders CANCELLED status with default style', () => {
    render(<TradeStatusBadge status="CANCELLED" />);
    const badge = screen.getByText('CANCELLED');
    expect(badge).toHaveClass('bg-slate-800/60', 'text-slate-300');
  });
});
