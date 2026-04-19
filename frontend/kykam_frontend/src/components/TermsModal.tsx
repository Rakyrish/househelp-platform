import React from 'react';
import { Modal, Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  userType: 'Worker' | 'Employer';
}

const TermsModal: React.FC<TermsModalProps> = ({ open, onClose, userType }) => {
  return (
    <Modal
      title={<Title level={4} style={{ margin: 0, color: '#f3a82f' }}>Terms and Conditions</Title>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      styles={{ body: { maxHeight: '60vh', overflowY: 'auto', paddingRight: '12px', marginTop: '16px' } }}
    >
      <Paragraph>
        Welcome to Kykam Househelp Agency. By registering as a {userType.toLowerCase()} on our platform, you agree to
        the following terms and conditions. Please read them carefully.
      </Paragraph>

      <Title level={5}>1. Introduction</Title>
      <Paragraph>
        These terms govern your use of the Kykam Househelp Agency platform, which connects employers with domestic workers across Kenya.
      </Paragraph>

      <Title level={5}>2. User Responsibilities ({userType})</Title>
      <Paragraph>
        {userType === 'Worker' ? (
          <>
            <Text strong>Workers</Text> are expected to provide accurate personal details, maintain professional conduct,
            and complete tasks assigned by employers as agreed upon. Workers must also upload valid identification documents
            such as a National ID for verification purposes. False information may lead to permanent account suspension and reporting.
          </>
        ) : (
          <>
            <Text strong>Employers</Text> are expected to treat workers fairly, provide a safe working environment,
            and adhere to the agreed salary and compensation timelines. You are responsible for ensuring your posted
            job requirements are clear and legal under Kenyan labor laws.
          </>
        )}
      </Paragraph>

      <Title level={5}>3. Privacy and Data Security</Title>
      <Paragraph>
        Your personal data is encrypted and stored securely. We do not sell your data to third parties. We use your
        information strictly for identity verification, job matching, and platform communication.
      </Paragraph>

      <Title level={5}>4. Payments and Fees</Title>
      <Paragraph>
        The platform may require payment of an activation fee or subscription. Payments made via M-Pesa are final and
        non-refundable unless explicitly stated otherwise by the platform's support administration.
      </Paragraph>

      <Title level={5}>5. Account Termination</Title>
      <Paragraph>
        Kykam Househelp Agency reserves the right to suspend or terminate accounts that violate these terms, engage in
        fraudulent activities, or receive multiple valid complaints from other users.
      </Paragraph>
      
      <Paragraph type="secondary" className="mt-8 text-xs text-center">
        Last updated: March 2026
      </Paragraph>
    </Modal>
  );
};

export default TermsModal;
