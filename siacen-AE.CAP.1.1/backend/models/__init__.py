# This file makes all models importable 
# from anywhere in the project like:
# from models import DiseaseDetection

from .diagnosis import (
    DiseaseDetection,
    DiagnosisDetail,
    Treatment,
    HealthStatus,
    Severity,
    Urgency,
    TreatmentType
)
from .sources import SourceReference
from .requests import (
    AnalyzeRequest,
    AnalyzeResponse,
    HealthCheck
)
from .feedback import (
    FeedbackRequest,
    FeedbackResponse
)