import React from 'react';
import Card from 'react-bootstrap/Card';

const SkeletonProduct = () => {
    return (
        <Card className="product-skeleton border-0 mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="skeleton" style={{ height: '200px', width: '100%' }}></div>
            <Card.Body>
                <div className="skeleton mb-2" style={{ height: '20px', width: '80%', borderRadius: '4px' }}></div>
                <div className="skeleton mb-3" style={{ height: '16px', width: '60%', borderRadius: '4px' }}></div>
                <div className="d-flex justify-content-between align-items-center">
                    <div className="skeleton" style={{ height: '24px', width: '40%', borderRadius: '4px' }}></div>
                    <div className="skeleton" style={{ height: '32px', width: '32px', borderRadius: '50%' }}></div>
                </div>
            </Card.Body>
        </Card>
    );
};

export default SkeletonProduct;
